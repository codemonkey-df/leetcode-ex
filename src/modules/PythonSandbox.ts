/**
 * Python Sandbox Client - Browser implementation
 * 
 * This client communicates with a backend server that safely executes Python code.
 * 
 * Backend (server/index.mjs) handles:
 * - Creating isolated venvs with `uv venv`
 * - Running pytest tests
 * - Cleanup after execution
 */

export interface TestCaseResult {
  input: string;
  expected: string;
  actual: string | null;
  passed: boolean;
  error?: string;
}

export interface ExecutionResult {
  passed: number;
  failed: number;
  total: number;
  results: TestCaseResult[];
  error?: string;
}

// Internal interface for test cases
interface InternalTestCase {
  input: unknown;
  output: unknown;
}

export class PythonSandbox {
  private readonly apiEndpoint = '/api/sandbox';
  private initialized = false;
  private sessionId: string | null = null;

  /**
   * Initialize the Python sandbox environment
   */
  async initialize(): Promise<void> {
    console.log('[PythonSandbox] Initializing...');
    try {
      const response = await fetch(`${this.apiEndpoint}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': `session-${Date.now()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      this.sessionId = data.sessionId;
      this.initialized = true;
      console.log('[PythonSandbox] Initialized successfully with sessionId:', this.sessionId);
    } catch (error) {
      console.error('[PythonSandbox] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute user code with test cases
   */
  async execute(
    code: string,
    testCases: Array<{ input: Record<string, unknown>; expected: unknown } | { input: string | Record<string, unknown>; output: string | unknown; explanation?: string }>
  ): Promise<ExecutionResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('[PythonSandbox] Executing code...');
      
      // Normalize test cases to the format the server expects
      // For expected/output, we preserve the original value for proper comparison
      const serializedTestCases: InternalTestCase[] = testCases.map(tc => ({
        input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
        // Use expected if available (from TestCase), otherwise use output
        output: typeof (tc as any).expected !== 'undefined' 
          ? JSON.stringify((tc as any).expected)
          : (typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output)),
      }));
      
      const response = await fetch(`${this.apiEndpoint}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': this.sessionId!,
        },
        body: JSON.stringify({ code, testCases: serializedTestCases }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result: ExecutionResult = await response.json();
      console.log('[PythonSandbox] Execution complete:', result.passed, 'passed');
      return result;
    } catch (error) {
      console.error('[PythonSandbox] Execution error:', error);
      throw error;
    }
  }

  /**
   * Clean up the sandbox environment
   */
  async cleanup(): Promise<void> {
    if (!this.initialized || !this.sessionId) return;

    try {
      await fetch(`${this.apiEndpoint}/cleanup`, {
        method: 'POST',
        headers: {
          'X-Session-Id': this.sessionId,
        },
      });
      this.initialized = false;
      this.sessionId = null;
      console.log('[PythonSandbox] Cleanup complete');
    } catch (error) {
      console.error('[PythonSandbox] Cleanup error:', error);
    }
  }
}
