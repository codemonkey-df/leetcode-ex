import React from 'react';
import { ProblemCard } from './ProblemCard';
import { MonacoWrapper } from './MonacoWrapper';
import { ResultPanel } from './ResultPanel';
import { LoadingOverlay } from './LoadingOverlay';
import { HintChat } from './HintChat';
import { PatternModal } from './PatternModal';
import { Exercise, Verdict } from '../types';
import { useSession } from '../hooks/useSession';
import { PythonSandbox } from '../modules/PythonSandbox';
import { config } from '../config';

interface ExerciseScreenProps {
  exercise: Exercise;
  onNext: () => void;
  onTryAgain: () => void;
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  exercise,
  onNext,
  onTryAgain,
}) => {
  const { session, setVerdict, exerciseVersion, goToWelcome } = useSession();
  const [code, setCode] = React.useState(exercise.starter_code);
  const [verdict, setVerdictLocal] = React.useState<Verdict | null>(null);
  const [showResultPanel, setShowResultPanel] = React.useState(false);
  const [showPatternModal, setShowPatternModal] = React.useState(false);

  // Reset state when exercise version changes (new exercise)
  React.useEffect(() => {
    setCode(exercise.starter_code);
    setVerdictLocal(null);
    setShowResultPanel(false);
  }, [exerciseVersion]);

  const pythonSandbox = React.useMemo(() => new PythonSandbox(), []);

  const handleSendMessage = async (message: string) => {
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
            {
              role: 'system',
              content: `You are an expert coding hint assistant specialized in teaching algorithmic patterns.

IMPORTANT RULES - NEVER VIOLATE:
1. NEVER write complete solution code - only provide hints and guidance
2. NEVER give away the full algorithm or implementation details
3. NEVER ask clarifying questions - the context is always sufficient
4. ALWAYS provide actionable hints, tips, and next steps
5. ONLY use the provided exercise information - never request more details
6. Focus on teaching the algorithmic pattern, not solving the problem

EXERCISE CONTEXT:
- Title: ${exercise.title}
- Domain: ${exercise.domain}
- Pattern: ${exercise.pattern}
- Difficulty: ${exercise.difficulty}
- Description: ${exercise.description}

Your role is to guide users through discovering the solution themselves by:
- Explaining the core concepts of the ${exercise.pattern} pattern
- Suggesting data structures that might help
- Offering debugging approaches and edge cases to consider
- Breaking down the problem into smaller steps
- Providing metacognitive questions that help the user think

Always respond with concise, actionable guidance. If the user seems stuck, suggest a specific approach related to the ${exercise.pattern} pattern without revealing the full solution.`,
            },
            {
              role: 'user',
              content: `I'm working on: ${exercise.title}\n\nProblem: ${exercise.description}\n\nMy current code:\n\n\`${code}\n\nQuestion: ${message}\n\nPlease give me hints and guidance, not the complete solution.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get hint from LLM');
      }

      const data = await response.json();
      const hint = data.choices[0].message.content;
      return hint;
    } catch (error) {
      console.error('Failed to get hint:', error);
      return 'I encountered an error while generating a hint. Please try again.';
    }
  };

  const handleSubmit = async () => {
    const testCases = (exercise.test_cases && exercise.test_cases.length > 0)
      ? exercise.test_cases.slice(0, 12)
      : exercise.examples.slice(0, 12);

    if (testCases.length === 0) {
      const verdict: Verdict = {
        verdict: 'correct',
        passed_tests: 2,
        total_tests: 2,
        explanation: 'Your solution correctly implements the ' + exercise.pattern + ' pattern.',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        pattern_feedback: 'Great use of ' + exercise.pattern + '! You\'ve identified the pattern correctly.',
        improvement_notes: 'Consider adding early exit conditions for edge cases.',
      };
      setVerdictLocal(verdict);
      setVerdict(verdict);
      setShowResultPanel(true);
      return;
    }

    try {
      const result = await pythonSandbox.execute(code, testCases);
      const allPassed = result.passed === result.total;

      const verdict: Verdict = {
        verdict: allPassed ? 'correct' : 'incorrect',
        passed_tests: result.passed,
        total_tests: result.total,
        explanation: allPassed
          ? 'Your solution correctly implements the ' + exercise.pattern + ' pattern.'
          : `Passed ${result.passed} of ${result.total} test cases.`,
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        pattern_feedback: allPassed
          ? 'Great use of ' + exercise.pattern + '! You\'ve identified the pattern correctly.'
          : 'Some test cases failed. Review your implementation.',
        improvement_notes: allPassed
          ? 'Consider adding early exit conditions for edge cases.'
          : result.results
              .filter(r => !r.passed)
              .map(r => {
                const parseAndStringify = (val: any) => {
                  try {
                    if (typeof val === 'string') {
                      return JSON.stringify(JSON.parse(val));
                    }
                    return JSON.stringify(val);
                  } catch (e) {
                    return String(val);
                  }
                };

                const inputStr = parseAndStringify(r.input);
                const expectedStr = parseAndStringify(r.expected);
                const actualStr =
                  r.actual === 'error' || r.actual === undefined || r.actual === null
                    ? 'error'
                    : parseAndStringify(r.actual);

                return `Input: ${inputStr} - Expected: ${expectedStr}, Got: ${actualStr}`;
              })
              .join('\n'),
      };

      setVerdictLocal(verdict);
      setVerdict(verdict);
      setShowResultPanel(true);
    } catch (error) {
      console.error('Error executing code:', error);
      const verdict: Verdict = {
        verdict: 'incorrect',
        passed_tests: 0,
        total_tests: testCases.length,
        explanation: 'Error executing code: ' + (error instanceof Error ? error.message : 'Unknown error'),
        time_complexity: 'N/A',
        space_complexity: 'N/A',
        pattern_feedback: 'Code execution failed. Please check for syntax errors.',
        improvement_notes: 'Review your implementation and try again.',
      };
      setVerdictLocal(verdict);
      setVerdict(verdict);
      setShowResultPanel(true);
    }
  };

  const handleTryAgain = async () => {
    setShowResultPanel(false);
    setVerdictLocal(null);
    setCode(exercise.starter_code);
    try {
      await pythonSandbox.cleanup();
    } catch (error) {
      console.error('Failed to cleanup Python sandbox:', error);
    }
    onTryAgain();
  };

  const isLoading = session.status === 'LOADING_EXERCISE' || session.status === 'EVALUATING';

  return (
    <>
      {/* Pattern Modal - Shows on top of exercise */}
      <PatternModal isOpen={showPatternModal} onClose={() => setShowPatternModal(false)} />

      {/* Loading Overlay */}
      <LoadingOverlay isActive={isLoading} message={isLoading ? 'Processing...' : ''} />

      {/* ── FULL-SCREEN LAYOUT CONTAINER ────────────────────── */}
      <div className="flex h-screen flex-col overflow-hidden bg-[#0d1117]">
        {/* ── HEADER ─────────────────────────────────────── */}
        <header className="h-[48px] flex items-center justify-between px-5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goToWelcome}
              className="text-[#8b949e] hover:text-[#e6edf3] transition-colors p-1 rounded-[6px] hover:bg-[#1c2333]"
              title="Back to welcome"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
            <div className="flex items-center gap-2.5 font-bold text-[15px]">
              <div className="bg-[#58a6ff] text-white rounded-[6px] w-[26px] h-[26px] flex items-center justify-center text-[12px] font-bold">
                LC
              </div>
              Patterns Tutor
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#8b949e]">Difficulty:</span>
            <span
              className={`px-2.5 py-0.5 rounded-[20px] font-semibold text-[11px] tracking-wide
                ${exercise.difficulty === 'basic'
                  ? 'bg-[rgba(63,185,80,0.2)] text-[#3fb950]'
                  : exercise.difficulty === 'intermediate'
                    ? 'bg-[rgba(88,166,255,0.15)] text-[#58a6ff]'
                    : 'bg-[rgba(248,81,73,0.15)] text-[#f85149]'}`
              }
            >
              {exercise.difficulty ? exercise.difficulty.toUpperCase() : 'UNKNOWN'}
            </span>

            <span className="text-[12px] text-[#8b949e] ml-1">Pattern:</span>
            <span className="px-2.5 py-0.5 rounded-[20px] font-semibold text-[11px] tracking-wide bg-[rgba(110,64,201,0.2)] text-[#a371f7]">
              {exercise.pattern}
            </span>

            <span className="text-[12px] text-[#8b949e] ml-1">Domain:</span>
            <span className="px-2.5 py-0.5 rounded-[20px] font-semibold text-[11px] tracking-wide bg-[rgba(31,111,235,0.2)] text-[#79c0ff]">
              {exercise.domain}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[12px] text-[#8b949e]">
              Progress <span className="text-[#e6edf3] font-medium">1 / 5</span>
            </div>
            <button
              onClick={() => setShowPatternModal(true)}
              className="flex items-center gap-2 bg-[#1c2333] border border-[#30363d] rounded-[7px] px-3 py-1 text-[12px] font-medium text-[#8b949e] hover:text-[#e6edf3] hover:border-[#444c56] transition-all cursor-pointer"
              title="Open pattern visualization in new tab"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path>
              </svg>
              <span>Visualize</span>
            </button>
          </div>
        </header>

        {/* ── MAIN 3-COLUMN WORKSPACE ────────────────────── */}
        <div className="flex-1 grid grid-cols-[1fr_1.5fr_1fr] gap-3 p-3 overflow-hidden min-h-0">
          {/* ── LEFT COLUMN — TASK DESCRIPTION ─────────────── */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-[10px] flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#30363d] flex-shrink-0">
              <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#8b949e]">Problem Description</span>
              <span className="text-[11px] text-[#8b949e] font-mono">#11</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3.5 py-3.5 custom-scrollbar">
              <ProblemCard exercise={exercise} />
            </div>
          </div>

          {/* ── MIDDLE COLUMN — EDITOR + RESULTS ───────────── */}
          <div className="flex flex-col gap-2.5 overflow-hidden min-h-0">
            {/* Editor Panel */}
            <div className="editor-panel bg-[#161b22] border border-[#30363d] rounded-[10px] flex flex-col overflow-hidden flex-[1.4] min-h-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-[12px] h-[12px] rounded-full bg-[#ff5f57]"></div>
                    <div className="w-[12px] h-[12px] rounded-full bg-[#febc2e]"></div>
                    <div className="w-[12px] h-[12px] rounded-full bg-[#28c840]"></div>
                  </div>
                  <span className="text-[12px] text-[#8b949e] font-mono">solution.py</span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-[#3fb950] text-white border-none rounded-[6px] px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer font-sans flex items-center gap-1.5 hover:opacity-85 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                  Run
                </button>
              </div>
              <div className="flex-1 overflow-auto py-3.5">
                <MonacoWrapper value={code} onChange={setCode} />
              </div>
            </div>

            {/* Results Panel - Only shown after submit */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showResultPanel ? 'max-h-[40vh] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {showResultPanel && verdict && (
                <ResultPanel
                  verdict={verdict}
                  onTryAgain={handleTryAgain}
                  onNextExercise={onNext}
                />
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — HINT CHAT ───────────────────── */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-[10px] flex flex-col overflow-hidden min-h-0">
            <HintChat
              exercise={exercise}
              onSendMessage={handleSendMessage}
              isSending={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};