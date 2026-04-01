import { describe, it, expect } from 'vitest';
import { buildSummarizePrompt } from './summarize';

describe('summarize prompt builder', () => {
  it('should build correct prompt structure', () => {
    const prompt = buildSummarizePrompt({
      exerciseTitle: 'Test',
      pattern: 'Two Pointers',
      difficulty: 'basic',
    });

    const parsed = JSON.parse(prompt);
    expect(parsed.action).toBe('summarize_exercise');
    expect(parsed.exercise_title).toBe('Test');
    expect(parsed.pattern).toBe('Two Pointers');
    expect(parsed.difficulty).toBe('basic');
  });
});
