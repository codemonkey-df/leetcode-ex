import { useState, createContext, useContext, ReactNode } from 'react';
import { Session, Exercise, Verdict } from '../types';
import { createExerciseGenerator } from '../modules/ExerciseGenerator';
import { LLMExerciseParser } from '../modules/LLMExerciseParser';

interface SessionContextType {
  session: Session;
  setDifficulty: (difficulty: 'basic' | 'intermediate' | 'advanced', excludePattern?: string) => void;
  startExercise: (exercise: Exercise) => void;
  setVerdict: (verdict: Verdict) => void;
  resetExercise: () => void;
  nextExercise: () => void;
  goToWelcome: () => void;
  exerciseVersion: number;
  triggerNewExercise: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    status: 'IDLE',
    difficulty: null,
    currentExercise: null,
    history: [],
  });
  const [exerciseVersion, setExerciseVersion] = useState(0);

  const triggerNewExercise = () => {
    setExerciseVersion(prev => prev + 1);
  };

  const setDifficulty = (difficulty: 'basic' | 'intermediate' | 'advanced', excludePattern?: string) => {
    setSession(prev => ({ ...prev, status: 'LOADING_EXERCISE', difficulty }));

    // Generate exercise asynchronously
    setTimeout(async () => {
      try {
        const generator = createExerciseGenerator();
        // Build patternsUsed array with excludePattern
        const patternsUsed: string[] = excludePattern ? [excludePattern] : [];
        console.log('Calling LLM with difficulty:', difficulty, 'excludePattern:', excludePattern);
        const result = await generator.generate(difficulty, patternsUsed);
        console.log('Exercise generation result:', result);
        if (result.success && result.exercise) {
          console.log('LLM Raw Response:', JSON.stringify(result.exercise, null, 2));
          
          // Use the LLMExerciseParser to parse the response
          const parsed = LLMExerciseParser.parse(result.exercise);
          if (!parsed) {
            console.log('Failed to parse exercise, using mock fallback');
            const mockExercise = getMockExercise(difficulty);
            setSession(prev => ({
              ...prev,
              status: 'CODING',
              currentExercise: mockExercise,
            }));
            return;
          }

          const exercise: Exercise = parsed;

          console.log('Parsed Exercise:', JSON.stringify(exercise, null, 2));
          setSession(prev => ({
            ...prev,
            status: 'CODING',
            currentExercise: exercise,
          }));
        } else {
          console.log('LLM failed, using mock exercise');
          // Fallback to mock if LLM fails
          const mockExercise = getMockExercise(difficulty);
          setSession(prev => ({
            ...prev,
            status: 'CODING',
            currentExercise: mockExercise,
          }));
        }
      } catch (error) {
        console.error('Error generating exercise:', error);
        // Fallback to mock if LLM fails
        const mockExercise = getMockExercise(difficulty);
        setSession(prev => ({
          ...prev,
          status: 'CODING',
          currentExercise: mockExercise,
        }));
      }
    }, 0);
  };

  const startExercise = (exercise: Exercise) => {
    setSession(prev => ({
      ...prev,
      status: 'CODING',
      currentExercise: exercise,
    }));
  };

  const setVerdict = (_verdict: Verdict) => {
    setSession(prev => ({
      ...prev,
      status: 'RESULT',
    }));
  };

  const resetExercise = () => {
    setSession(prev => ({
      ...prev,
      status: 'CODING',
    }));
  };

  const nextExercise = () => {
    if (session.difficulty && session.currentExercise) {
      // Store current exercise-verdict pair in history before generating new one
      const currentVerdict: Verdict = {
        verdict: 'none',
        passed_tests: 0,
        total_tests: 0,
        explanation: '',
        time_complexity: '',
        space_complexity: '',
        pattern_feedback: '',
        improvement_notes: '',
      };
      
      const currentPattern = session.currentExercise.pattern;
      
      setSession(prev => ({
        ...prev,
        status: 'LOADING_EXERCISE',
        history: [...prev.history, { exercise: prev.currentExercise!, verdict: currentVerdict }],
      }));
      // Trigger version update to reset components
      triggerNewExercise();
      // Generate next exercise avoiding the current pattern
      setDifficulty(session.difficulty, currentPattern);
    }
  };

  const goToWelcome = () => {
    setSession(prev => ({
      ...prev,
      status: 'IDLE',
      difficulty: null,
      currentExercise: null,
      history: [],
    }));
    // Reset exercise version for fresh start
    triggerNewExercise();
  };

  // Helper function to create a mock exercise for fallback
  const getMockExercise = (difficulty: 'basic' | 'intermediate' | 'advanced'): Exercise => ({
    title: 'Example Problem',
    domain: 'Arrays',
    pattern: 'Two Pointers',
    difficulty,
    description: 'This is a placeholder problem description for demonstration purposes.',
    constraints: ['1 <= nums.length <= 1000'],
    examples: [{ input: '[1, 2, 3]', output: 'true' }],
    starter_code: `def example(nums: list[int]) -> bool:\n    # Your code here\n    pass`,
    guidance_intro: 'Think about using two pointers to solve this problem efficiently.',
    test_cases: [],
  });

  const value = {
    session,
    setDifficulty,
    startExercise,
    setVerdict,
    resetExercise,
    nextExercise,
    goToWelcome,
    exerciseVersion,
    triggerNewExercise,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
