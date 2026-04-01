export interface EvaluateSolutionParams {
  exerciseTitle: string;
  pattern: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  userCode: string;
  testCases: Array<{ input: Record<string, unknown>; expected: unknown }>;
}

/**
 * System role definition for solution evaluation
 */
const SYSTEM_ROLE = `You are an expert coding instructor and software engineer.
Your task is to evaluate Python solutions to coding exercises.
Analyze correctness, time/space complexity, and pattern application.
Always respond with valid JSON only.`;

/**
 * Base instruction for solution evaluation
 */
const BASE_INSTRUCTION = `Evaluate the provided Python solution against the given test cases.

Provide a comprehensive analysis including:
1. Whether the solution is correct (passes all test cases)
2. Time and space complexity analysis
3. Feedback on pattern application
4. Improvement suggestions if applicable

Return your response as a JSON object with the exact structure specified below.
Do NOT include any markdown formatting or additional text.`;

/**
 * Difficulty-specific evaluation criteria
 */
const DIFFICULTY_CRITERIA: Record<string, string> = {
  basic: `
DIFFICULTY: Basic
- Focus on correct pattern application
- Basic complexity analysis (O(n), O(log n), etc.)
- Simple improvement suggestions
`,
  intermediate: `
DIFFICULTY: Intermediate
- Evaluate efficient pattern application
- Analyze trade-offs in solution approach
- Consider data structure choices
`,
  advanced: `
DIFFICULTY: Advanced
- Evaluate optimal pattern combinations
- Analyze complex time/space trade-offs
- Consider scalability with large inputs
- Check for edge case handling
`,
};

/**
 * Expected output structure
 */
const OUTPUT_STRUCTURE = `Return a JSON object with the following structure:
{
  "verdict": "correct|incorrect|partial",
  "passed_tests": number,
  "total_tests": number,
  "explanation": "Detailed explanation of correctness",
  "time_complexity": "O(...) - Big O time complexity analysis",
  "space_complexity": "O(...) - Big O space complexity analysis",
  "pattern_feedback": "Feedback on pattern application",
  "improvement_notes": "Suggestions for improvement (can be null if solution is optimal)",
  "failed_cases": [] (array of any failed test case details)
}`;

export function buildEvaluateSolutionPrompt(params: EvaluateSolutionParams): string {
  const { exerciseTitle, pattern, difficulty, userCode, testCases } = params;

  let prompt = `${SYSTEM_ROLE}\n\n${BASE_INSTRUCTION}\n\n${OUTPUT_STRUCTURE}`;

  prompt += `\n\n${DIFFICULTY_CRITERIA[difficulty]}`;

  prompt += `
\n\n=== EXERCISE DETAILS ===
Exercise Title: ${exerciseTitle}
Pattern: ${pattern}

=== USER CODE ===
${userCode}

=== TEST CASES ===
Total test cases: ${testCases.length}
`;

  testCases.forEach((tc, index) => {
    prompt += `\nTest Case ${index + 1}:\nInput: ${JSON.stringify(tc.input)}\nExpected: ${JSON.stringify(tc.expected)}\n`;
  });

  return prompt;
}

/**
 * Builds the JSON payload for LLM API calls
 */
export function buildEvaluateSolutionPayload(params: EvaluateSolutionParams): string {
  const { exerciseTitle, pattern, difficulty, userCode, testCases } = params;

  return JSON.stringify({
    action: 'evaluate_solution',
    exercise_title: exerciseTitle,
    pattern: pattern,
    difficulty: difficulty,
    user_code: userCode,
    test_cases: testCases,
  });
}
