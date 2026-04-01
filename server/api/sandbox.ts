import { Router, Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestCase {
  input: string;
  output: string;
}

interface ExecutionRequest {
  code: string;
  testCases: TestCase[];
}

interface ExecutionResult {
  passed: number;
  failed: number;
  total: number;
  results: Array<{ input: string; expected: string; actual: string | null; passed: boolean; error?: string }>;
}

const router = Router();
const sandboxes = new Map<string, string>(); // map of session_id -> venv_path

/**
 * Initialize a new Python sandbox environment
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string || `session-${Date.now()}`;
    const venvPath = path.join(os.tmpdir(), `leetcode-ex-${sessionId}-${Date.now()}`);

    // Create the temporary directory
    fs.mkdirSync(venvPath, { recursive: true });

    // Create virtual environment with uv
    await execAsync(`uv venv --python 3.13 "${venvPath}"`, {
      timeout: 60000,
    });

    // Install pytest
    await execAsync(`uv pip install pytest pytest-mock`, {
      cwd: venvPath,
      timeout: 120000,
    });

    sandboxes.set(sessionId, venvPath);

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Failed to initialize sandbox:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize Python environment' });
  }
});

/**
 * Execute user code with test cases
 */
router.post('/execute', async (req: Request, res: Response) => {
  const { code, testCases } = req.body as ExecutionRequest;
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId || !sandboxes.has(sessionId)) {
    return res.status(400).json({ error: 'Sandbox not initialized' });
  }

  const venvPath = sandboxes.get(sessionId)!;

  try {
    // Create temp directory for test file
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-ex-'));
    const testFile = path.join(tempDir, 'test_solution.py');

    // Generate test file
    const funcMatch = code.match(/def\s+(\w+)\s*\(/);
    const funcName = funcMatch ? funcMatch[1] : 'solution';

    const testFunctions = testCases.map((tc, idx) => {
      const inputStr = JSON.stringify(JSON.parse(tc.input));
      const expectedStr = tc.output; // Use the raw value, don't double-serialize
      
      // Parse input to get the parameter name and value
      // Input format is like {"s": "xyyx"} or {"height": [1,8,6,2,5,4,8,3,7]}
      const inputObj = JSON.parse(tc.input);
      const paramNames = Object.keys(inputObj);
      
      // Build the function call with the correct parameter(s)
      let funcCall = `${funcName}(`;
      const paramValues: string[] = [];
      
      for (const paramName of paramNames) {
        const paramValue = inputObj[paramName];
        // String values need quotes, numbers/arrays/objects don't
        let formattedValue: string;
        if (typeof paramValue === 'string') {
          formattedValue = JSON.stringify(paramValue);
        } else if (Array.isArray(paramValue) || typeof paramValue === 'object') {
          formattedValue = JSON.stringify(paramValue);
        } else {
          formattedValue = String(paramValue);
        }
        paramValues.push(formattedValue);
      }
      
      funcCall += paramValues.join(', ') + `)`;
      
      return `
def test_${idx + 1}():
    """Test case ${idx + 1}"""
    result = ${funcCall}
    expected = ${expectedStr}
    assert result == expected, f"Expected {expected}, got {result}"
`;
    }).join('\n');

    const testContent = `${code}

${testFunctions}
`;
    fs.writeFileSync(testFile, testContent);

    // Run pytest
    const { stdout, stderr } = await execAsync(
      `uv run pytest ${testFile} -v --tb=short`,
      { cwd: venvPath, timeout: 60000, encoding: 'utf8' }
    );

    const output = stdout + stderr;
    console.log('Pytest output:', output);

    // Parse results
    const results: Array<{ input: string; expected: string; actual: string | null; passed: boolean; error?: string }> = [];

    testCases.forEach((tc, idx) => {
      const testName = `test_${idx + 1}`;
      const passed = output.includes(`${testName} PASSED`);
      const actual = passed ? tc.output : null;

      results.push({
        input: tc.input,
        expected: tc.output,
        actual,
        passed,
        error: passed ? undefined : 'Test failed',
      });
    });

    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;

    res.json({ passed, failed, total: results.length, results });
  } catch (error: any) {
    const errorMessage = error.stdout || error.stderr || error.message;
    console.error('Execution error:', errorMessage);

    const results = testCases.map(tc => ({
      input: tc.input,
      expected: tc.output,
      actual: null,
      passed: false,
      error: errorMessage,
    }));

    res.json({ passed: 0, failed: testCases.length, total: testCases.length, results });
  }
});

/**
 * Cleanup a sandbox environment
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId || !sandboxes.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const venvPath = sandboxes.get(sessionId)!;
  sandboxes.delete(sessionId);

  try {
    await execAsync(`rm -rf "${venvPath}"`);
    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, error: 'Failed to cleanup' });
  }
});

export default router;
