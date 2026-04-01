export interface SummarizeParams {
  exerciseTitle: string;
  pattern: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

/**
 * System role definition for exercise summarization
 */
const SYSTEM_ROLE = `You are an expert coding instructor specializing in algorithmic pattern teaching.
Your task is to generate concise, insightful summaries of coding exercises that reinforce
the learned pattern and provide transferable insights.
Always respond with valid JSON only.`;

/**
 * Base instruction for exercise summarization
 */
const BASE_INSTRUCTION = `Generate a brief summary of the completed exercise that:
1. Recaps what pattern was used and why
2. Highlights the key insight or "aha" moment
3. Provides a transferable pattern tip for future problems
4. Reinforces the learning objective

Return your response as a JSON object with the exact structure specified below.
Keep the summary concise (3-4 sentences) but insightful.
Do NOT include any markdown formatting or additional text.`;

/**
 * Difficulty-specific summarization guidance
 */
const DIFFICULTY_GUIDANCE: Record<string, string> = {
  basic: `
DIFFICULTY: Basic
- Focus on core pattern understanding
- Emphasize pattern recognition cues
- Keep insights simple and concrete
`,
  intermediate: `
DIFFICULTY: Intermediate
- Highlight pattern application strategy
- Discuss trade-offs and alternatives
- Connect to similar patterns
`,
  advanced: `
DIFFICULTY: Advanced
- Discuss pattern combination insights
- Analyze complexity trade-offs
- Provide advanced pattern recognition tips
`,
};

/**
 * Expected output structure
 */
const OUTPUT_STRUCTURE = `Return a JSON object with the following structure:
{
  "summary": "Concise recap of pattern used and key insight",
  "pattern_tip": "Transferable tip for future problems using this pattern"
}`;

export function buildSummarizePrompt(params: SummarizeParams): string {
  const { exerciseTitle, pattern, difficulty } = params;

  let prompt = `${SYSTEM_ROLE}\n\n${BASE_INSTRUCTION}\n\n${OUTPUT_STRUCTURE}`;

  prompt += `\n\n${DIFFICULTY_GUIDANCE[difficulty]}`;

  prompt += `
\n\n=== EXERCISE DETAILS ===
Exercise Title: ${exerciseTitle}
Pattern: ${pattern}`;

  return prompt;
}

/**
 * Builds the JSON payload for LLM API calls
 */
export function buildSummarizePayload(params: SummarizeParams): string {
  const { exerciseTitle, pattern, difficulty } = params;

  return JSON.stringify({
    action: 'summarize_exercise',
    exercise_title: exerciseTitle,
    pattern: pattern,
    difficulty: difficulty,
  });
}
