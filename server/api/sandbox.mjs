import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Store sandbox environments - one per session, but keep them alive
const sandboxes = new Map(); // session_id -> { venvPath, initTime }

// Global sandbox - reused across all requests
let globalSandbox = null;

/**
 * Initialize a new Python sandbox environment
 */
const initSandbox = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || `session-${Date.now()}`;
    
    // Reuse existing sandbox if available
    if (globalSandbox) {
      sandboxes.set(sessionId, { ...globalSandbox });
      res.json({ success: true, sessionId, reused: true });
      return;
    }
    
    const venvPath = path.join(os.tmpdir(), `leetcode-ex-${Date.now()}`);
    console.log(`[Sandbox] Creating venv at ${venvPath}`);

    fs.mkdirSync(venvPath, { recursive: true });

    await execAsync(`uv venv --python 3.13 "${venvPath}"`, { timeout: 120000 });
    console.log('[Sandbox] Installed pytest');
    await execAsync(`uv pip install pytest pytest-mock`, { cwd: venvPath, timeout: 120000 });

    globalSandbox = { venvPath, initTime: Date.now() };
    sandboxes.set(sessionId, { ...globalSandbox });

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('[Sandbox] Failed to initialize:', error.message);
    res.status(500).json({ success: false, error: 'Failed to initialize Python environment' });
  }
};

/**
 * Execute user code with test cases
 */
const executeCode = async (req, res) => {
  const { code, testCases } = req.body;
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !sandboxes.has(sessionId)) {
    return res.status(400).json({ error: 'Sandbox not initialized' });
  }

  const sandbox = sandboxes.get(sessionId);
  const venvPath = sandbox.venvPath;

  console.log(`[Sandbox] Executing test with ${testCases.length} test cases`);

  try {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-ex-'));
    const testFile = path.join(tempDir, 'test_solution.py');

    const funcMatch = code.match(/def\s+(\w+)\s*\(/);
    const funcName = funcMatch ? funcMatch[1] : 'solution';

    // Generate pytest code
    // tc.input is JSON string like '{"s":"xyyx"}'
    // tc.output is JSON string like '4' or '"result"' or 'true'/'false'
    const testFunctions = testCases.map((tc, idx) => {
      const inputObj = JSON.parse(tc.input);
      const expectedVal = JSON.parse(tc.output);  // Parse to get actual value
      
      // Build function call from input object
      const inputStr = JSON.stringify(inputObj);
      const paramNames = Object.keys(inputObj);
      
      let funcCall = `${funcName}(`;
      const paramValues = [];
      
      for (const paramName of paramNames) {
        const paramValue = inputObj[paramName];
        // Format value: strings get quoted, numbers/arrays/objects use JSON
        let formattedValue;
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
      
      // Convert JSON true/false to Python True/False
      let expectedStr = tc.output;
      if (expectedStr === 'true') expectedStr = 'True';
      if (expectedStr === 'false') expectedStr = 'False';
      
      return `
def test_${idx + 1}():
    result = ${funcCall}
    expected = ${expectedStr}
    assert result == expected, f"Expected {expected}, got {result}"
`;
    }).join('\n');

    const testContent = `${code}\n\n${testFunctions}`;
    fs.writeFileSync(testFile, testContent);

    let stdout, stderr;
    try {
      const result = await execAsync(
        `uv run pytest ${testFile} -v --tb=short`,
        { cwd: venvPath, timeout: 60000, encoding: 'utf8' }
      );
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      // pytest returns non-zero exit code when tests fail - capture output anyway
      stdout = error.stdout || '';
      stderr = error.stderr || '';
    }

    const output = stdout + stderr;
    // Parse results
    const results = testCases.map((tc, idx) => {
      const testName = `test_${idx + 1}`;
      const passed = output.includes(`${testName} PASSED`);
      
      // Extract actual error from pytest output if test failed
      let actualError = undefined;
      if (!passed) {
        // Try to extract from AssertionError: Expected X, got Y
        const errorMatch = output.match(new RegExp(`${testName} FAILED.*?AssertionError: Expected (.*?), got ([^\n]+)`, 's'));
        if (errorMatch) {
          actualError = errorMatch[2].trim();
        } else {
          actualError = 'error';
        }
      }
      
      return {
        input: tc.input,
        expected: tc.output,
        actual: passed ? tc.output : actualError,
        passed,
        error: passed ? undefined : actualError,
      };
    });

    const passed = results.filter(r => r.passed).length;
    res.json({ passed, failed: results.length - passed, total: results.length, results });
    
  } catch (error) {
    const errorMessage = error.stdout || error.stderr || error.message;
    console.error('[Sandbox] Error:', errorMessage);

    const results = testCases.map(tc => ({
      input: tc.input,
      expected: tc.output,
      actual: 'error',
      passed: false,
      error: errorMessage,
    }));

    res.json({ passed: 0, failed: testCases.length, total: testCases.length, results });
  }
};

/**
 * Cleanup a sandbox environment
 */
const cleanupSandbox = async (req, res) => {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !sandboxes.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const sandbox = sandboxes.get(sessionId);
  sandboxes.delete(sessionId);

  // Don't cleanup global sandbox - keep it alive for reuse
  if (!globalSandbox || sandbox.venvPath !== globalSandbox.venvPath) {
    try {
      await execAsync(`rm -rf "${sandbox.venvPath}"`);
      console.log('[Sandbox] Cleanup complete');
    } catch (error) {
      console.error('[Sandbox] Cleanup error:', error);
    }
  }

  res.json({ success: true });
};

const router = (req, res, next) => {
  if (req.url === '/init' && req.method === 'POST') {
    return initSandbox(req, res);
  }
  if (req.url === '/execute' && req.method === 'POST') {
    return executeCode(req, res);
  }
  if (req.url === '/cleanup' && req.method === 'POST') {
    return cleanupSandbox(req, res);
  }
  next();
};

export default router;
