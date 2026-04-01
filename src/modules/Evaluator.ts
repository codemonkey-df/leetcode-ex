import { Verdict } from '../types';
import { buildEvaluateSolutionPrompt } from '../prompts/evaluateSolution';
import { config } from '../config';

export interface Evaluator {
  evaluate: (
    exerciseTitle: string,
    pattern: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    userCode: string,
    testCases: Array<{ input: Record<string, unknown>; expected: unknown }>
  ) => Promise<{ success: boolean; verdict?: Verdict; error?: string }>;
}

export function createEvaluator(): Evaluator {
  const evaluate = async (
    exerciseTitle: string,
    pattern: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    userCode: string,
    testCases: Array<{ input: Record<string, unknown>; expected: unknown }>
  ): Promise<{ success: boolean; verdict?: Verdict; error?: string }> => {
    const prompt = buildEvaluateSolutionPrompt({
      exerciseTitle,
      pattern,
      difficulty,
      userCode,
      testCases,
    });

    const response = await fetch(`${config.llmApiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.llmApiKey}`,
      },
      body: JSON.stringify({
        model: config.llmModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      return { success: false, error: `LLM API error: ${response.statusText}` };
    }

    try {
      const data = await response.json();
      const verdictData = JSON.parse(data.choices[0].message.content);
      
      return {
        success: true,
        verdict: {
          verdict: verdictData.verdict,
          passed_tests: verdictData.passed_tests,
          total_tests: verdictData.total_tests,
          explanation: verdictData.explanation,
          time_complexity: verdictData.time_complexity,
          space_complexity: verdictData.space_complexity,
          pattern_feedback: verdictData.pattern_feedback,
          improvement_notes: verdictData.improvement_notes,
          failed_cases: verdictData.failed_cases,
        },
      };
    } catch (error) {
      return { success: false, error: 'Failed to parse verdict response' };
    }
  };

  return { evaluate };
}

const SYSTEM_PROMPT = `You are a LeetCode interview coach. Evaluate Python solutions for coding exercises.
Return evaluation results in JSON format with verdict, test results, and feedback.`;
