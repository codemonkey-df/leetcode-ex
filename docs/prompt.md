# LeetCode Exercise Generation Prompt Architecture

## Overview

This document defines the prompt architecture for generating Python coding exercises that teach algorithmic patterns. The system generates exercises on-the-fly using an LLM, with three separate prompts corresponding to difficulty levels: **Basic**, **Intermediate**, and **Advanced**.

---

## Core Principles

### 1. Avoid Duplicate Exercises
- Each exercise must be a **novel variant** within the same algorithmic domain
- Do not generate exact LeetCode problems; instead, create variations using:
  - Different input constraints
  - Modified problem statements
  - Alternative data structures
  - Changed edge cases

### 2. Algorithm Pattern Mastery (Not Memorization)
- Exercises should teach the **pattern's core insight**, not memorization of specific problems
- Each problem variant must reinforce the same pattern while requiring creative application

### 3. Progressive Difficulty
- **Basic**: Single-pattern problems, small inputs, obvious pattern application
- **Intermediate**: Pattern applied to slightly complex data structures or multi-step logic
- **Advanced**: Multi-pattern problems, nuanced constraints, or complex pattern combinations

---

## Prompt Structure

Each prompt consists of:

1. **System Role** — Defines the LLM's persona and output requirements
2. **Base Instruction** — Universal guidance for all difficulty levels (with examples)
3. **Difficulty-Specific Section** — Level-tailored requirements and constraints

---

## Prompt 1: Basic Difficulty

### System Role

```
You are an expert coding instructor specializing in teaching algorithmic patterns.
Your task is to generate beginner-friendly Python coding exercises that teach
core algorithmic concepts. Always respond with valid JSON only.
```

### Base Instruction

```
Generate a Python coding exercise that teaches a specific algorithmic pattern.
The exercise should be approachable for beginners with basic Python knowledge.

IMPORTANT: Create a NOVEL variant of the pattern—not a direct LeetCode problem.
Use the same algorithmic approach but with:
- Different problem framing
- Modified input constraints
- Unique edge cases
- Alternative data structures (arrays vs lists, etc.)

Return your response as a JSON object with the exact structure specified below.
Do NOT include any markdown formatting or additional text.
```

### Difficulty-Specific Requirements

```
DIFFICULTY: Basic

TARGET PATTERNS (Tier 1 only):
- Two Pointers (pair sum, palindromes, merging)
- Sliding Window (substring constraints)
- Binary Search (simple sorted array search)
- BFS/DFS (tree traversals, simple graph connectivity)

INPUT CONSTRAINTS:
- Small input sizes (n <= 100)
- Minimal edge cases (1-2 special cases)
- Clear, straightforward problem statement

EXPECTED TIME: 5-15 minutes

HINT PROGRESSION: Up to 3 progressive hints

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a sorted array and target sum, find if any PAIR adds up to target"
   (Twosum variant using Two Pointers on sorted input)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 1: Two Sum" is forbidden)
```

### Expected JSON Output Structure

```json
{
  "title": "Pair Sum in Sorted Array",
  "domain": "Arrays",
  "pattern": "Two Pointers",
  "difficulty": "basic",
  "description": "Given a sorted array of integers and a target value, determine if there exists a pair of elements that sum to the target. Return true if such a pair exists, false otherwise.",
  "constraints": [
    "1 <= nums.length <= 100",
    "-1000 <= nums[i] <= 1000",
    "The array is guaranteed to be sorted in ascending order"
  ],
  "examples": [
    {
      "input": {"nums": [1, 2, 3, 4, 5], "target": 9},
      "output": true,
      "explanation": "4 + 5 = 9"
    },
    {
      "input": {"nums": [1, 2, 3, 4, 5], "target": 100},
      "output": false,
      "explanation": "No pair sums to 100"
    }
  ],
  "starter_code": "def pair_sum(nums: list[int], target: int) -> bool:\n    # Your code here\n    pass",
  "guidance_intro": "In this exercise, you should find if any two numbers in the sorted array add up to the target. Think about using two boundaries—one starting from the beginning and one from the end—that move toward each other based on their sum comparison.",
  "test_cases": [
    {"input": {"nums": [1, 2, 3, 4, 5], "target": 9}, "expected": true},
    {"input": {"nums": [1, 2, 3, 4, 5], "target": 100}, "expected": false},
    {"input": {"nums": [-5, -3, 0, 2, 4], "target": -1}, "expected": true},
    {"input": {"nums": [1], "target": 1}, "expected": false}
  ]
}
```

---

## Prompt 2: Intermediate Difficulty

### System Role

```
You are an expert coding instructor specializing in teaching intermediate algorithmic patterns.
Your task is to generate intermediate-level Python coding exercises that teach
patterns applied to slightly more complex scenarios. Always respond with valid JSON only.
```

### Base Instruction

```
Generate a Python coding exercise that teaches an intermediate-level algorithmic pattern.
The exercise should require the student to apply pattern knowledge to non-trivial scenarios
involving multiple data structures or stepped logic.

IMPORTANT: Create a NOVEL variant—not a direct LeetCode problem.
Use the same algorithmic approach but with:
- More complex data structures (trees, graphs, hash maps)
- Multi-step problem decomposition
- Additional constraints that don't change the core pattern
- Less obvious pattern application (student must recognize the pattern)

Return your response as a JSON object with the exact structure specified below.
Do NOT include any markdown formatting or additional text.
```

### Difficulty-Specific Requirements

```
DIFFICULTY: Intermediate

TARGET PATTERNS (Tier 1 and Tier 2):
- Backtracking (subsets, permutations, combinations)
- Dynamic Programming (1D state, classic variants)
- Fast & Slow Pointers (linked list cycles, middle element)
- Heap/Priority Queue (top-K, stream problems)
- Union-Find (basic connected components)
- Trie (prefix search basics)

INPUT CONSTRAINTS:
- Medium input sizes (n <= 1000)
- Multiple edge cases (3-4 special cases)
- Problem statement requires pattern recognition

EXPECTED TIME: 15-30 minutes

HINT PROGRESSION: 2 progressive hints

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a binary tree, find the maximum path sum where the path can start and end at any node"
   (DP on trees variant using 1D state + recursion)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 226: Invert Binary Tree" is forbidden)
```

### Expected JSON Output Structure

```json
{
  "title": "Maximum Path Sum in Binary Tree",
  "domain": "Trees",
  "pattern": "Dynamic Programming",
  "difficulty": "intermediate",
  "description": "Given the root of a binary tree where each node contains an integer value, find the maximum path sum. A path is defined as any sequence of nodes from some starting node to any node, where each pair of adjacent nodes is connected by an edge. The path does not need to pass through the root.",
  "constraints": [
    "The number of nodes in the tree is in the range [1, 1000]",
    "-1000 <= Node.val <= 1000"
  ],
  "examples": [
    {
      "input": {"tree": [1, 2, 3]},
      "output": 6,
      "explanation": "The optimal path is 2 -> 1 -> 3 with sum 6"
    },
    {
      "input": {"tree": [-10, 9, 20, null, null, 15, 7]},
      "output": 42,
      "explanation": "The optimal path is 15 -> 20 -> 7 with sum 42"
    }
  ],
  "starter_code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef max_path_sum(root: TreeNode) -> int:\n    # Your code here\n    pass",
  "guidance_intro": "In this exercise, you should find the maximum path sum in a binary tree where the path can start and end at any node. Think about using dynamic programming: for each node, compute the maximum path sum that includes that node as the highest node, and track the global maximum across all nodes.",
  "test_cases": [
    {"input": {"tree": [1, 2, 3]}, "expected": 6},
    {"input": {"tree": [-10, 9, 20, "null", "null", 15, 7]}, "expected": 42},
    {"input": {"tree": [5]}, "expected": 5},
    {"input": {"tree": [-3]}, "expected": -3},
    {"input": {"tree": [1, -2, 3]}, "expected": 4}
  ]
}
```

---

## Prompt 3: Advanced Difficulty

### System Role

```
You are an expert coding instructor specializing in teaching advanced algorithmic patterns.
Your task is to generate advanced-level Python coding exercises that teach
complex pattern applications and multi-pattern combinations. Always respond with valid JSON only.
```

### Base Instruction

```
Generate a Python coding exercise that teaches an advanced-level algorithmic pattern.
The exercise should require the student to combine multiple patterns or apply a pattern
in a nuanced, complex scenario.

IMPORTANT: Create a NOVEL variant—not a direct LeetCode problem.
Use the same algorithmic approaches but with:
- Multi-pattern problems (e.g., DP + Graph, Trie + Backtracking)
- Complex constraints that interact with the pattern
- Subtle pattern application requiring deep insight
- Large input sizes requiring optimal solutions

Return your response as a JSON object with the exact structure specified below.
Do NOT include any markdown formatting or additional text.
```

### Difficulty-Specific Requirements

```
DIFFICULTY: Advanced

TARGET PATTERNS (All patterns, including combinations):
- DP (2D state, complex state transitions)
- Union-Find (advanced optimizations, dynamic connectivity)
- Trie (complex prefix problems, multiple strings)
- Topological Sort / Cycle Detection (DAG scheduling, course prerequisites)
- Graph algorithms (shortest paths, MST, network flow basics)
- Pattern combinations (e.g., DP + Heap, BFS + Bitmask)

INPUT CONSTRAINTS:
- Large input sizes (n <= 10^4 to 10^5)
- Multiple interacting constraints
- Problem statement requires pattern recognition and combination

EXPECTED TIME: 30-60 minutes

HINT PROGRESSION: 1 hint (or none — user must request)

EXAMPLE OF DESIRED EXERCISE:
✅ GOOD: "Given a list of word pairs that are anagrams of each other, find the longest chain where each word can be transformed to the next by removing exactly one character"
   (Graph + DP + Anagram detection variant)

❌ AVOID: Direct LeetCode problem statements
   (e.g., "LeetCode 210: Course Schedule II" is forbidden)
```

### Expected JSON Output Structure

```json
{
  "title": "Longest Anagram Chain",
  "domain": "Strings",
  "pattern": "Graph + Dynamic Programming",
  "difficulty": "advanced",
  "description": "Given a list of unique words where all words are anagrams of each other (same letters, different order), find the length of the longest chain of words where each word in the chain can be transformed to the next word by removing exactly one character. Words in the chain must maintain the anagram property.",
  "constraints": [
    "1 <= words.length <= 1000",
    "1 <= words[i].length <= 16",
    "words[i] consists of lowercase English letters",
    "All words are anagrams of each other (same character counts)"
  ],
  "examples": [
    {
      "input": {"words": ["oat", "at", "a"]},
      "output": 3,
      "explanation": "Chain: 'oat' -> 'at' -> 'a' (remove one character each step, all are anagrams)"
    },
    {
      "input": {"words": ["eat", "at", "eta", "ta"]},
      "output": 3,
      "explanation": "Chain: 'eat' -> 'at' -> 'ta' or 'eta' -> 'ta' -> 'at'"
    }
  ],
  "starter_code": "def longest_anagram_chain(words: list[str]) -> int:\n    # Your code here\n    pass",
  "guidance_intro": "In this exercise, you should find the longest chain of anagram words where each word transforms to the next by removing one character. Think about modeling this as a graph: each word is a node, and there's an edge from word A to word B if removing one character from A produces an anagram of B. Then use dynamic programming with memoization to find the longest path in this directed acyclic graph.",
  "test_cases": [
    {"input": {"words": ["oat", "at", "a"]}, "expected": 3},
    {"input": {"words": ["eat", "at", "eta", "ta"]}, "expected": 3},
    {"input": {"words": ["abc"]}, "expected": 1},
    {"input": {"words": ["abcd", "bcd", "cd", "d"]}, "expected": 4},
    {"input": {"words": ["listen", "isten", "sten", "ten", "en", "n"]}, "expected": 6}
  ]
}
```

---

## Implementation Guidelines

### For Exercise Generation

1. **Pattern Selection**: Choose patterns following the difficulty tiers
2. **Novel Variant Creation**:
   - Modify problem framing (not just numbers)
   - Change data structures while keeping the pattern
   - Adjust constraints to require the same pattern
   - Create unique edge cases
3. **Avoid重复**: Check `patterns_used_so_far` and avoid exact matches
4. **Test Cases**: Include 3-5 diverse test cases covering normal, edge, and boundary cases

### For Hint Generation

Hints should be progressive:
- **Level 1**: Pattern name + general approach direction
- **Level 2**: Key insight/data structure choice
- **Level 3**: Near-pseudocode walkthrough

### For Solution Evaluation

The evaluator should check:
- Correctness (passes all test cases)
- Time complexity (appropriate for input size)
- Space complexity (efficient use of memory)
- Pattern application (proper use of the target pattern)

---

## Example Prompt Payloads

### Exercise Generation Payload

```json
{
  "action": "generate_exercise",
  "difficulty": "basic",
  "patterns_used_so_far": ["Two Pointers", "Sliding Window"],
  "avoid_repeat": true
}
```

### Hint Payload

```json
{
  "action": "give_hint",
  "exercise_title": "Pair Sum in Sorted Array",
  "pattern": "Two Pointers",
  "hint_level": 1,
  "current_code": "def two_sum(...):\n    pass"
}
```

### Evaluation Payload

```json
{
  "action": "evaluate_solution",
  "exercise_title": "Pair Sum in Sorted Array",
  "pattern": "Two Pointers",
  "difficulty": "basic",
  "user_code": "def two_sum(nums, target):\n    left, right = 0, len(nums)-1\n    while left < right:\n        s = nums[left] + nums[right]\n        if s == target:\n            return True\n        elif s < target:\n            left += 1\n        else:\n            right -= 1\n    return False",
  "test_cases": [
    {"input": {"nums": [1,2,3,4,5], "target": 9}, "expected": true},
    {"input": {"nums": [1,2,3,4,5], "target": 100}, "expected": false}
  ]
}
```

---

## Summary

This prompt architecture ensures:
- ✅ Three separate, difficulty-appropriate prompts
- ✅ Base prompts with examples and expected output
- ✅ Difficulty-specific requirements and constraints
- ✅ Novel problem variants within algorithmic domains
- ✅ Pattern mastery focus (not memorization)
- ✅ LLM creativity to maximize learning per level
- ✅ Avoidance of duplicate exercises
- ✅ Alignment with appropriate LeetCode approaches
