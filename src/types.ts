export interface TestCase {
  input: Record<string, unknown>;
  expected: unknown;
}

export interface Example {
  input: string | Record<string, unknown>;
  output: string | unknown;
  explanation?: string;
}

export interface Exercise {
  title: string;
  domain: string;
  pattern: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  description: string;
  constraints: string[];
  examples: Example[];
  starter_code: string;
  guidance_intro: string;
  test_cases: TestCase[];
  // LLM teaching content
  teaching_points?: string[];
  teaching_notes?: string[];
}



export interface Verdict {
  verdict: 'correct' | 'incorrect' | 'partial' | 'none';
  passed_tests: number;
  total_tests: number;
  explanation: string;
  time_complexity: string;
  space_complexity: string;
  pattern_feedback: string;
  improvement_notes?: string;
  failed_cases?: Array<{ input: string; expected: string; actual: string }>;
}

export interface Summary {
  summary: string;
  pattern_tip: string;
}

export type SessionStatus = 'IDLE' | 'LOADING_EXERCISE' | 'CODING' | 'EVALUATING' | 'RESULT';

export interface Session {
  status: SessionStatus;
  difficulty: 'basic' | 'intermediate' | 'advanced' | null;
  currentExercise: Exercise | null;
  history: { exercise: Exercise; verdict: Verdict }[];
}

export interface Config {
  llmApiBase: string;
  llmApiKey: string;
  llmModel: string;
}
