import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Python Sandbox using uv for isolated execution
 */
export class PythonSandbox {
  private venvPath: string;
  private containerId: string | null = null;

  constructor() {
    this.venvPath = path.join(os.tmpdir(), `leetcode-ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }

  /**
   * Initialize a Python virtual environment using uv
   */
  async initialize(): Promise<void> {
    try {
      // Create the temporary directory
      fs.mkdirSync(this.venvPath, { recursive: true });

      // Create virtual environment with uv
      await execAsync(`uv venv --python 3.13 "${this.venvPath}"`, {
        timeout: 60000, // 60 seconds
      });

      // Install pytest
      await execAsync(`uv pip install pytest pytest-mock`, {
        cwd: this.venvPath,
        timeout: 120000, // 120 seconds
      });
    } catch (error) {
      console.error('Failed to initialize Python sandbox:', error);
      throw error;
    }
  }

  /**
   * Generate a pytest test file from test cases
   */
  private generateTests(code: string, testCases: Array<{ input: string; output: string }>): string {
    // Convert test cases to pytest format
    const testFunctions = testCases.map((tc, idx) => {
      const inputStr = JSON.stringify(JSON.parse(tc.input));
      const expectedStr = JSON.stringify(tc.output);
      return `
def test_${idx + 1}():
    result = maxArea(${inputStr})
    assert result == ${expectedStr}, f"Expected ${expectedStr}, got {result}"
`;
    }).join('\n');

    return `import sys
sys.path.insert(0, '${this.venvPath}')

${code}

${testFunctions}
`;
  }

  /**
   * Execute user code with test cases
   */
  async execute(
    code: string,
    testCases: Array<{ input: string; output: string }>
  ): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: Array<{
      input: string;
      expected: string;
      actual: string | null;
      passed: boolean;
      error?: string;
    }>;
    error?: string;
  }> {
    const results: Array<{
      input: string;
      expected: string;
      actual: string | null;
      passed: boolean;
      error?: string;
    }> = [];

    let passed = 0;
    let failed = 0;

    try {
      // Generate test file
      const testContent = this.generateTests(code, testCases);
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-ex-'));
      const testFile = path.join(tempDir, 'test_solution.py');
      fs.writeFileSync(testFile, testContent);

      // Run pytest
      const { stdout, stderr } = await execAsync(
        `uv run pytest ${testFile} -v`,
        { cwd: this.venvPath, timeout: 60000 }
      );

      // Parse pytest output
      const output = stdout + stderr;
      console.log('Pytest output:', output);

      // Extract results from output
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);

      if (passMatch) {
        passed = parseInt(passMatch[1], 10);
      }
      if (failMatch) {
        failed = parseInt(failMatch[1], 10);
      }

      // Build results array
      testCases.forEach((tc, idx) => {
        const idxStr = String(idx + 1);
        const passedThis = output.includes(`test_${idxStr} PASSED`);
        const actual = passedThis ? tc.output : null;
        const error = passedThis ? undefined : 'Test failed';

        results.push({
          input: tc.input,
          expected: tc.output,
          actual,
          passed: passedThis,
          error,
        });
      });
    } catch (error: any) {
      const errorMessage = error.stdout ? error.stdout + '\n' + error.stderr : error.message;
      
      testCases.forEach((tc) => {
        results.push({
          input: tc.input,
          expected: tc.output,
          actual: null,
          passed: false,
          error: errorMessage,
        });
      });
      failed = testCases.length;
    } finally {
      // Cleanup temp files
      try {
        // fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Failed to cleanup temp files:', cleanupError);
      }
    }

    return {
      passed,
      failed,
      total: testCases.length,
      results,
    };
  }

  /**
   * Clean up the virtual environment
   */
  async cleanup(): Promise<void> {
    try {
      // Remove the virtual environment directory
      if (fs.existsSync(this.venvPath)) {
        await execAsync(`rm -rf "${this.venvPath}"`);
      }
    } catch (error) {
      console.error('Failed to cleanup Python sandbox:', error);
    }
  }
}
