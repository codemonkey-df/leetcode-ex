import { Exercise } from '../types';

/**
 * Parses LLM-generated exercise responses with various format support.
 * Handles both nested ({ exercise: {...}, teaching_notes: [...] }) and flat formats.
 */
export class LLMExerciseParser {
  /**
   * Parse LLM response and extract exercise data
   * @param response - Raw LLM response (object or JSON string)
   * @returns Parsed Exercise or null if parsing fails
   */
  static parse(response: any): Exercise | null {
    try {
      // If response is a string, try to parse it
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }

      // Handle nested format: { exercise: {...}, teaching_notes: [...] }
      const nested = response as any;
      const llmExercise = nested.exercise || nested;
      const teachingNotes = nested.teaching_notes || [];
      // hintsArray removed - hints are no longer used

      // Extract all fields
      const pattern = this.extractPattern(llmExercise);
      const domain = this.extractDomain(pattern, llmExercise);
      const description = this.extractDescription(llmExercise);
      const examples = this.extractExamples(llmExercise);
      const starterCode = this.extractStarterCode(llmExercise);
      const guidanceIntro = this.extractGuidanceIntro(llmExercise, teachingNotes);
      const constraints = this.extractConstraints(llmExercise);
      const difficultyRaw = this.extractDifficulty(llmExercise);
      const difficulty = (difficultyRaw as 'basic' | 'intermediate' | 'advanced') || 'basic';
      const title = llmExercise.title || 'Example Problem';
      const testCases = this.extractTestCases(llmExercise);
      return {
        title,
        domain,
        pattern,
        difficulty,
        description,
        constraints,
        examples,
        starter_code: starterCode,
        guidance_intro: guidanceIntro,
        test_cases: testCases,
        // teaching_points and teaching_notes are already parsed in the type
        teaching_points: llmExercise.teaching_points as string[] | undefined,
        teaching_notes: teachingNotes,
      };
    } catch (error) {
      console.error('LLMExerciseParser: Failed to parse response', error);
      return null;
    }
  }

  /**
   * Extract pattern from LLM response
   * Tries 'pattern', 'patterns', 'patterns_covered', 'pattern_teaching' in order
   */
  private static extractPattern(llmExercise: any): string {
    // Try 'pattern' (string)
    if (llmExercise.pattern && typeof llmExercise.pattern === 'string') {
      return llmExercise.pattern;
    }

    // Try 'patterns' (array) - take first element
    const patternsArray = (llmExercise.patterns || []) as string[];
    if (patternsArray.length > 0) {
      return patternsArray[0].replace(/_/g, ' ');
    }

    // Try 'patterns_covered' (array) - take first element
    const patternsCovered = (llmExercise.patterns_covered || []) as string[];
    if (patternsCovered.length > 0) {
      return patternsCovered[0].replace(/_/g, ' ');
    }

    // Try 'pattern_teaching'
    if (llmExercise.pattern_teaching && typeof llmExercise.pattern_teaching === 'string') {
      return llmExercise.pattern_teaching;
    }

    return 'Hash Map + Sorting';
  }

  /**
   * Extract domain based on pattern keywords
   */
  private static extractDomain(pattern: string, llmExercise: any): string {
    // Check if domain is explicitly provided
    if (llmExercise.domain && typeof llmExercise.domain === 'string') {
      return llmExercise.domain;
    }

    const patternLower = pattern.toLowerCase();

    // Pattern-based domain detection
    if (patternLower.includes('tree') || patternLower.includes('binary') || patternLower.includes('postorder')) {
      return 'Trees';
    }
    if (patternLower.includes('graph') || patternLower.includes('bfs') || patternLower.includes('dfs')) {
      return 'Graphs';
    }
    if (patternLower.includes('dp') || patternLower.includes('dynamic') || patternLower.includes('program')) {
      return 'Dynamic Programming';
    }
    if (patternLower.includes('hash map') || patternLower.includes('hash table') || patternLower.includes('hash set')) {
      return 'Hash Maps';
    }
    if (patternLower.includes('monotonic stack') || patternLower.includes('monotonic queue') || patternLower.includes('monotonic')) {
      return 'Stacks and Queues';
    }
    if (patternLower.includes('two pointer') || patternLower.includes('two sum')) {
      return 'Arrays';
    }
    if (patternLower.includes('string') || patternLower.includes('substring') || patternLower.includes('regex')) {
      return 'Strings';
    }
    if (patternLower.includes('interval') || patternLower.includes('merge')) {
      return 'Arrays';
    }
    if (patternLower.includes('sliding window') || patternLower.includes('sliding window log')) {
      return 'Strings';
    }

    // Default fallback for other patterns
    return 'Arrays';
  }

  /**
   * Extract description from LLM response
   * Tries 'description', 'problem', 'problem_statement', 'explanation' in order
   */
  private static extractDescription(llmExercise: any): string {
    const descriptionFields = ['description', 'problem', 'problem_statement', 'explanation'];
    for (const field of descriptionFields) {
      if (llmExercise[field] && typeof llmExercise[field] === 'string') {
        return llmExercise[field];
      }
    }

    return 'Problem description not available.';
  }

  /**
   * Extract examples from LLM response
   * Handles 'example' (single object), 'examples' (array), 'example_test_cases' (array)
   * Preserves full objects for parsing later (input/output may be JSON objects, not strings)
   */
  private static extractExamples(llmExercise: any): any[] {
    const result: any[] = [];

    // Try 'examples' array
    const examplesArray = (llmExercise.examples || []) as any[];
    if (examplesArray.length > 0) {
      return examplesArray.map((ex: any) => ({
        input: ex.input,
        output: ex.output !== undefined ? ex.output : ex.expected_output,
        explanation: ex.explanation,
      }));
    }

    // Try 'example_test_cases' array
    const testCases = (llmExercise.example_test_cases || []) as any[];
    if (testCases.length > 0) {
      return testCases.map((tc: any) => ({
        input: tc.input,
        output: tc.output !== undefined ? tc.output : tc.expected,
        explanation: tc.explanation,
      }));
    }

    // Try single 'example' object
    if (llmExercise.example) {
      const ex = llmExercise.example as any;
      if (typeof ex === 'string') {
        return [{ input: ex, output: 'See problem' }];
      } else if (typeof ex === 'object') {
        return [{
          input: ex.input,
          output: ex.output !== undefined ? ex.output : 'See problem',
          explanation: ex.explanation,
        }];
      }
    }

    return result;
  }

  /**
   * Format example value for display
   */
  private static formatExampleValue(val: unknown): string {
    if (val === null || val === undefined) {
      return 'null';
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';

      // If all elements are strings, format as code block
      const allStrings = val.every((item: any) => typeof item === 'string');
      if (allStrings) {
        return val.map((item: string) => `> ${item}`).join('\n');
      }

      // For arrays of numbers/objects, use JSON
      return JSON.stringify(val, null, 2);
    }

    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }

    return String(val);
  }

  /**
   * Extract starter code from LLM response
   * Tries 'starter_code', 'function_signature', 'solution_template' in order
   */
  private static extractStarterCode(llmExercise: any): string {
    // Try 'starter_code.python'
    if (llmExercise.starter_code && typeof llmExercise.starter_code === 'object') {
      const code = llmExercise.starter_code.python;
      if (code && typeof code === 'string') {
        return code;
      }
      // Try first available language
      for (const key of Object.keys(llmExercise.starter_code)) {
        const code = llmExercise.starter_code[key];
        if (code && typeof code === 'string') {
          return code;
        }
      }
    }

    // Try 'starter_code' (string)
    if (llmExercise.starter_code && typeof llmExercise.starter_code === 'string') {
      return llmExercise.starter_code;
    }

    // Try 'function_signature'
    if (llmExercise.function_signature && typeof llmExercise.function_signature === 'string') {
      return llmExercise.function_signature;
    }

    // Try 'solution_template'
    if (llmExercise.solution_template && typeof llmExercise.solution_template === 'string') {
      return llmExercise.solution_template;
    }

    return 'def solution():\n    pass';
  }

  /**
   * Extract constraints from LLM response
   * Handles both array and object formats
   */
  private static extractConstraints(llmExercise: any): string[] {
    const constraintRaw = llmExercise.constraints;
    if (!constraintRaw) return [];

    if (Array.isArray(constraintRaw)) {
      return constraintRaw as string[];
    }

    if (typeof constraintRaw === 'object') {
      return Object.entries(constraintRaw).map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      });
    }

    return [];
  }

  /**
   * Extract guidance intro from LLM response
   * Priority: hint, teaching_points, learning_objectives, follow_up_questions, explanation
   */
  private static extractGuidanceIntro(
    llmExercise: any,
    teachingNotes: string[]
  ): string {
    // Try 'hint' first
    if (llmExercise.hint && typeof llmExercise.hint === 'string') {
      return llmExercise.hint;
    }

    // Try 'teaching_points'
    if (teachingNotes.length > 0) {
      return teachingNotes[0];
    }

    // Try 'learning_objectives'
    const learningObjectives = (llmExercise.learning_objectives || []) as string[];
    if (learningObjectives.length > 0) {
      return learningObjectives[0];
    }

    // Try 'follow_up_questions'
    const followUpQuestions = (llmExercise.follow_up_questions || []) as string[];
    if (followUpQuestions.length > 0) {
      return followUpQuestions[0];
    }

    // Try 'explanation'
    if (llmExercise.explanation && typeof llmExercise.explanation === 'string') {
      return llmExercise.explanation;
    }

    return 'Solve using the appropriate pattern.';
  }



  /**
   * Extract difficulty from LLM response
   * Handles various formats: 'basic', 'intermediate', 'advanced', or string numbers
   */
  private static extractDifficulty(llmExercise: any): string | null {
    const diff = llmExercise.difficulty;

    if (diff === undefined || diff === null) {
      return null;
    }

    // Convert to lowercase for comparison
    const diffLower = String(diff).toLowerCase().trim();

    // Normalize to valid difficulty values
    if (diffLower === 'easy' || diffLower === 'basic' || diffLower === 'beginner') {
      return 'basic';
    }
    if (diffLower === 'medium' || diffLower === 'intermediate' || diffLower === 'normal') {
      return 'intermediate';
    }
    if (diffLower === 'hard' || diffLower === 'advanced' || diffLower === 'expert') {
      return 'advanced';
    }

    return null;
  }

  /**
   * Extract test cases from LLM response
   * Handles 'test_cases' array (preferred) or falls back to 'examples' for testing
   */
  private static extractTestCases(llmExercise: any): Array<{ input: Record<string, unknown>; expected: unknown }> {
    // Try 'test_cases' first (preferred for automated testing)
    const testCasesRaw = llmExercise.test_cases;
    if (testCasesRaw && Array.isArray(testCasesRaw)) {
      return testCasesRaw.map((tc: any) => ({
        input: this.extractTestCaseInput(tc),
        expected: this.extractTestCaseExpected(tc),
      }));
    }

    // Fallback: use 'examples' as test cases
    const examplesRaw = llmExercise.examples;
    if (examplesRaw && Array.isArray(examplesRaw)) {
      return examplesRaw.map((ex: any) => ({
        input: this.extractTestCaseInput(ex),
        expected: this.extractTestCaseExpected(ex),
      }));
    }

    return [];
  }

  /**
   * Extract input from test case or example
   */
  private static extractTestCaseInput(item: any): Record<string, unknown> {
    if (!item) return {};
    
    // Direct object input
    if (item.input && typeof item.input === 'object' && !Array.isArray(item.input)) {
      return item.input;
    }
    
    // If input is a JSON string, parse it
    if (typeof item.input === 'string') {
      try {
        return JSON.parse(item.input);
      } catch {
        // Fallback for format like {"param": value}
        return {};
      }
    }
    
    return {};
  }

  /**
   * Extract expected output from test case or example
   */
  private static extractTestCaseExpected(item: any): unknown {
    if (!item) return null;
    
    // Try 'expected' first
    if (item.expected !== undefined) {
      return item.expected;
    }
    
    // Try 'output'
    if (item.output !== undefined) {
      return item.output;
    }
    
    return null;
  }
}
