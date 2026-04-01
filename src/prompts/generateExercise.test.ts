import { describe, it, expect } from 'vitest';
import { buildGenerateExercisePrompt } from './generateExercise';

describe('generateExercise prompt builder', () => {
  it('should build correct prompt structure', () => {
    const prompt = buildGenerateExercisePrompt({
      difficulty: 'basic',
      patternsUsedSoFar: ['Two Pointers'],
      avoidRepeat: true,
    });

    const parsed = JSON.parse(prompt);
    expect(parsed.action).toBe('generate_exercise');
    expect(parsed.difficulty).toBe('basic');
    expect(parsed.patterns_used_so_far).toEqual(['Two Pointers']);
    expect(parsed.avoid_repeat).toBe(true);
  });
});
