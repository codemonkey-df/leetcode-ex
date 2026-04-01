export interface GiveHintParams {
  exerciseTitle: string;
  pattern: string;
  hintLevel: 1 | 2 | 3;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  currentCode: string;
}

/**
 * System role definition for hint generation
 */
const SYSTEM_ROLE = `You are an expert coding instructor who teaches through guided discovery.
Your task is to provide progressive hints that help students discover the solution
without giving away the answer. Always respond with valid JSON only.`;

/**
 * Base instruction for hint generation
 */
const BASE_INSTRUCTION = `Provide a hint for the current exercise following the hint level guidelines.
The hint should guide the student toward the solution using the target pattern.

Hint Levels:
- Level 1: Name the pattern + general approach direction (big picture)
- Level 2: Key insight/data structure choice (technical details)
- Level 3: Near-pseudocode walkthrough (implementation guidance)

Return your response as a JSON object with the exact structure specified below.
Keep hints concise and focused.
Do NOT include any markdown formatting or additional text.`;

export function buildGiveHintPrompt(params: GiveHintParams): string {
  const { exerciseTitle, pattern, hintLevel, currentCode } = params;

  let prompt = `${SYSTEM_ROLE}\n\n${BASE_INSTRUCTION}`;

  prompt += `
\n\n=== EXERCISE DETAILS ===
Exercise Title: ${exerciseTitle}
Pattern: ${pattern}
Hint Level: ${hintLevel}

=== CURRENT CODE ===
${currentCode}

=== HINT GUIDANCE ===
`;

  const hintGuidance = {
    1: 'Provide the pattern name and general approach direction. Focus on the big-picture strategy.',
    2: 'Explain the key insight, data structure choice, or technical approach.',
    3: 'Provide near-pseudocode guidance that closely resembles the actual solution.',
  };

  prompt += hintGuidance[hintLevel];

  return prompt;
}

/**
 * Builds the JSON payload for LLM API calls
 */
export function buildGiveHintPayload(params: GiveHintParams): string {
  const { exerciseTitle, pattern, hintLevel, currentCode } = params;

  return JSON.stringify({
    action: 'give_hint',
    exercise_title: exerciseTitle,
    pattern: pattern,
    hint_level: hintLevel,
    current_code: currentCode,
  });
}
