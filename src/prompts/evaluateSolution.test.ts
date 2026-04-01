import { describe, it, expect } from 'vitest';
import { buildEvaluateSolutionPrompt } from './evaluateSolution';

describe('evaluateSolution prompt builder', () => {
  it('should build correct prompt structure', () => {
    const prompt = buildEvaluateSolutionPrompt({
      exerciseTitle: 'Test',
      pattern: 'Two Pointers',
      difficulty: 'basic',
      userCode: 'def test():\n    pass',
      testCases: [{ input: { nums: [1, 2, 3] }, expected: [0, 1] }],
    });

    const parsed = JSON.parse(prompt);
    expect(parsed.action).toBe('evaluate_solution');
    expect(parsed.exercise_title).toBe('Test');
    expect(parsed.pattern).toBe('Two Pointers');
    expect(parsed.difficulty).toBe('basic');
    expect(parsed.user_code).toBe('def test():\n    pass');
    expect(parsed.test_cases).toHaveLength(1);
  });
});
