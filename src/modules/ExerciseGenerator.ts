import { config } from '../config';
import { Exercise } from '../types';
import { buildGenerateExercisePrompt } from '../prompts/generateExercise';

export interface ExerciseGenerator {
  generate: (difficulty: 'basic' | 'intermediate' | 'advanced', patternsUsed?: string[]) => Promise<{ success: boolean; exercise?: Exercise; error?: string }>;
}

export function createExerciseGenerator(): ExerciseGenerator {
  const callLLM = async <T,>(prompt: string, systemPrompt?: string): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const response = await fetch(`${config.llmApiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.llmApiKey}`,
        },
        body: JSON.stringify({
          model: config.llmModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.choices[0].message.content) as T;
      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const generate = async (
    difficulty: 'basic' | 'intermediate' | 'advanced',
    patternsUsed: string[] = []
  ): Promise<{ success: boolean; exercise?: Exercise; error?: string }> => {
    const prompt = buildGenerateExercisePrompt({
      difficulty,
      patternsUsedSoFar: patternsUsed,
      avoidRepeat: true,
    });

    const response = await callLLM<Exercise>(prompt, SYSTEM_PROMPT);
    
    if (!response.success) {
      return { success: false, error: response.error };
    }

    return { success: true, exercise: response.data };
  };

  return { generate };
}

const SYSTEM_PROMPT = `You are a LeetCode interview coach. Generate Python coding exercises 
that teach specific algorithmic patterns. Always respond with valid JSON only.

IMPORTANT: Your response MUST be a JSON object with the following structure:

{
  "exercise": {
    "title": "Problem Title",
    "description": "Detailed problem description",
    "pattern": "Pattern Name (e.g., Two Pointers, Hash Map, Dynamic Programming)",
    "difficulty": "basic|intermediate|advanced",
    "constraints": ["Constraint 1", "Constraint 2"],
    "examples": [
      {
        "input": "Input value",
        "output": "Expected output value"
      }
    ],
    "starter_code": {
      "python": "def solution():\n    pass"
    },
    "teaching_points": [
      "First teaching point",
      "Second teaching point",
      "Third teaching point"
    ]
  },
  "teaching_notes": [
    "Additional teaching note 1",
    "Additional teaching note 2"
  ]
}

Alternative single-exercise format (without nested 'exercise' key):
{
  "title": "Problem Title",
  "description": "Detailed problem description",
  ...
}

CRITICAL REQUIREMENT FOR EXAMPLES:
- Generate EXACTLY 12 test examples in the examples array
- The first 2 examples are for user guidance (show what input/output looks like)
- The remaining 10 examples will be used by the Python sandbox for automated testing
- Each example must have a unique input that tests different edge cases
- Ensure test cases cover: normal cases, edge cases (empty, single element), boundary conditions, and special scenarios

Follow these guidelines:
- Use 'basic' for easy problems, 'intermediate' for medium, 'advanced' for hard
- Patterns should be descriptive (e.g., 'Two Pointers', 'Sliding Window', 'Monotonic Stack')
- Include at least 2-3 teaching points explaining the key concepts
- Explain the time and space complexity in teaching_points`
