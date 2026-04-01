

export interface GenerateExerciseParams {
  difficulty: 'basic' | 'intermediate' | 'advanced';
  patternsUsedSoFar?: string[];
  avoidRepeat?: boolean;
}

// =============================================================================
// PATTERN TIERS - Explicit pattern names for each difficulty level
// =============================================================================

/**
 * Tier 1: Foundational patterns for basic problems
 */
const TIER1 = `
- Two Pointers (pair sum, palindromes, merging)
- Sliding Window (substring constraints)
- Binary Search (simple sorted array search)
- BFS/DFS (tree traversals, simple graph connectivity)
`;

/**
 * Tier 2: Intermediate patterns that build on Tier 1
 */
const TIER2 = `
- Backtracking (subsets, permutations, combinations)
- Dynamic Programming (1D state, classic variants)
- Fast & Slow Pointers (linked list cycles, middle element)
- Heap/Priority Queue (top-K, stream problems)
- Union-Find (basic connected components)
- Trie (prefix search basics)
`;

/**
 * Tier 3: Advanced patterns and combinations
 */
const TIER3 = `
- DP (2D state, complex state transitions)
- Union-Find (advanced optimizations, dynamic connectivity)
- Trie (complex prefix problems, multiple strings)
- Topological Sort / Cycle Detection (DAG scheduling, course prerequisites)
- Graph algorithms (shortest paths, MST, network flow basics)
- Pattern combinations (e.g., DP + Heap, BFS + Bitmask)
`;

/**
 * Pattern tier descriptions for prompt generation
 * Accepts optional excludePatterns to list patterns NOT to use
 */
const TIER_DESCRIPTIONS = {
  basic: (excludePatterns?: string[]) => {
    let result = `TARGET PATTERNS (Tier 1 only):${TIER1}`;
    if (excludePatterns && excludePatterns.length > 0) {
      const patternsList = excludePatterns.join(', ');
      result += `\n\nNOTE: DO NOT use these patterns (already recently used): ${patternsList}`;
    }
    return result;
  },
  intermediate: (excludePatterns?: string[]) => {
    let result = `TARGET PATTERNS (Tier 1 and Tier 2):${TIER1}${TIER2}`;
    if (excludePatterns && excludePatterns.length > 0) {
      const patternsList = excludePatterns.join(', ');
      result += `\n\nNOTE: DO NOT use these patterns (already recently used): ${patternsList}`;
    }
    return result;
  },
  advanced: (excludePatterns?: string[]) => {
    let result = `TARGET PATTERNS (All tiers - Tier 1, Tier 2, and Tier 3):${TIER1}${TIER2}${TIER3}`;
    if (excludePatterns && excludePatterns.length > 0) {
      const patternsList = excludePatterns.join(', ');
      result += `\n\nNOTE: DO NOT use these patterns (already recently used): ${patternsList}`;
    }
    return result;
  },
};

/**
 * System role definition for exercise generation
 */
const SYSTEM_ROLE = `You are an expert coding instructor specializing in teaching algorithmic patterns.
Your task is to generate Python coding exercises that teach specific algorithmic concepts.
Always respond with valid JSON only.`;

/**
 * Base instruction for exercise generation (common across all difficulty levels)
 */
const BASE_INSTRUCTION = `Generate a Python coding exercise that teaches a specific algorithmic pattern.

IMPORTANT: Create a NOVEL variant of the pattern—not a direct LeetCode problem.
Use the same algorithmic approach but with:
- Different problem framing
- Modified input constraints
- Unique edge cases
- Alternative data structures (arrays vs lists, etc.)

IMPORTANT: If a pattern is specified as already used, you MUST choose a different pattern.

Return your response as a JSON object with the exact structure specified below.
Do NOT include any markdown formatting or additional text.`;

/**
 * Builds difficulty-specific instructions with optional pattern exclusions
 */
const DIFFICULTY_INSTRUCTIONS: Record<string, (excludePatterns?: string[]) => string> = {
  basic: (excludePatterns?: string[]) => `
DIFFICULTY: Basic

${TIER_DESCRIPTIONS.basic(excludePatterns)}
INPUT CONSTRAINTS:
- Small input sizes (n <= 100)
- Minimal edge cases (1-2 special cases)
- Clear, straightforward problem statement

IMPORTANT: If a pattern is specified as already used, you MUST choose a different pattern.

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a sorted array and target sum, find if any PAIR adds up to target"
   (Twosum variant using Two Pointers on sorted input)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 1: Two Sum" is forbidden)
`,
  intermediate: (excludePatterns?: string[]) => `
DIFFICULTY: Intermediate

${TIER_DESCRIPTIONS.intermediate(excludePatterns)}
INPUT CONSTRAINTS:
- Medium input sizes (n <= 1000)
- Multiple edge cases (3-4 special cases)
- Problem statement requires pattern recognition

IMPORTANT: If a pattern is specified as already used, you MUST choose a different pattern.

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a binary tree, find the maximum path sum where the path can start and end at any node"
   (DP on trees variant using 1D state + recursion)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 226: Invert Binary Tree" is forbidden)
`,
  advanced: (excludePatterns?: string[]) => `
DIFFICULTY: Advanced

${TIER_DESCRIPTIONS.advanced(excludePatterns)}
INPUT CONSTRAINTS:
- Large input sizes (n <= 10^4 to 10^5)
- Multiple interacting constraints
- Problem statement requires pattern recognition and combination

IMPORTANT: If a pattern is specified as already used, you MUST choose a different pattern.

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a list of word pairs that are anagrams of each other, find the longest chain where each word can be transformed to the next by removing exactly one character"
   (Graph + DP + Anagram detection variant)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 210: Course Schedule II" is forbidden)
`,
};

/**
 * Expected output structure guidance
 */
const OUTPUT_STRUCTURE = `Return a JSON object with the following structure:
{
  "title": "Exercise Title",
  "domain": "Data Structure/Domain",
  "pattern": "Pattern Name",
  "difficulty": "basic|intermediate|advanced",
  "description": "Detailed problem description",
  "constraints": ["Constraint 1", "Constraint 2"],
  "examples": [
    {
      "input": {"param1": value1, "param2": value2},
      "output": expected_output,
      "explanation": "Brief explanation"
    }
  ],
  "starter_code": "def function_name(params):\n    # Your code here\n    pass",
  "guidance_intro": "Instructional guidance for the student",
  "test_cases": [
    {"input": {"param1": value1, "param2": value2}, "expected": expected_output}
  ]
}`;

/**
 * Builds the complete exercise generation prompt
 */
export function buildGenerateExercisePrompt(params: GenerateExerciseParams): string {
  const { difficulty, patternsUsedSoFar = [], avoidRepeat = true } = params;

  // Start with system role
  let prompt = `${SYSTEM_ROLE}\n\n${BASE_INSTRUCTION}\n\n${OUTPUT_STRUCTURE}`;

  // Add difficulty-specific instructions
  prompt += `\n\n${DIFFICULTY_INSTRUCTIONS[difficulty](avoidRepeat ? patternsUsedSoFar : undefined)}`;

  // Add pattern usage context (redundant but reinforces for LLM)
  if (patternsUsedSoFar.length > 0 && avoidRepeat) {
    const patternsList = patternsUsedSoFar.join(', ');
    const patternText = patternsUsedSoFar.length === 1 ? 'pattern' : 'patterns';
    prompt += `\n\nFINAL REMINDER: DO NOT use the following ${patternText} (already recently used): ${patternsList}`;
    prompt += `\nSelect a DIFFERENT algorithmic pattern to provide variety and reinforce learning.`;
  }

  return prompt;
}

/**
 * Builds the JSON payload for LLM API calls
 */
export function buildGenerateExercisePayload(params: GenerateExerciseParams): string {
  const { difficulty, patternsUsedSoFar = [], avoidRepeat = true } = params;

  return JSON.stringify({
    action: 'generate_exercise',
    difficulty,
    patterns_used_so_far: patternsUsedSoFar,
    avoid_repeat: avoidRepeat,
    // Include tier information for reference
    available_patterns: {
      tier1: TIER1.trim(),
      tier2: TIER2.trim(),
      tier3: TIER3.trim(),
    },
  });
}
