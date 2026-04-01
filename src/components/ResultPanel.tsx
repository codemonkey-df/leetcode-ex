import React from 'react';
import { Verdict } from '../types';

interface ResultPanelProps {
  verdict: Verdict;
  onTryAgain: () => void;
  onNextExercise: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ 
  verdict, 
  onTryAgain, 
  onNextExercise 
}) => {
  const isCorrect = verdict.verdict === 'correct';
  const isPartial = verdict.verdict === 'partial';

  // Generate test case indicators
  const renderTestCases = () => {
    const total = verdict.total_tests;
    const passed = verdict.passed_tests;
    const indicators = [];
    
    for (let i = 1; i <= Math.min(total, 12); i++) {
      const passedIndex = i <= passed;
      indicators.push(
        <div
          key={i}
          className={`w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[10px] font-bold font-mono
            ${passedIndex 
              ? 'bg-[rgba(63,185,80,0.2)] text-[#3fb950] border border-[rgba(63,185,80,0.3)]' 
              : 'bg-[rgba(248,81,73,0.2)] text-[#f85149] border border-[rgba(248,81,73,0.3)]'
            }`}
        >
          {i}
        </div>
      );
    }
    
    // Show ellipsis if more than 12 test cases
    if (total > 12) {
      indicators.push(
        <div key="ellipsis" className="w-[28px] h-[28px] flex items-center justify-center text-[10px] text-[#8b949e]">
          ...
        </div>
      );
    }
    
    return indicators;
  };

  return (
    <div className="results-panel bg-[#161b22] border border-[#30363d] rounded-[10px] flex flex-col overflow-hidden">
      {/* Results Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[#30363d] flex-shrink-0">
        <div className={`status-badge flex items-center gap-1.5 font-bold text-[14px] ${isCorrect ? 'text-[#3fb950]' : isPartial ? 'text-[#d29922]' : 'text-[#f85149]'}`}>
          {isCorrect ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          ) : isPartial ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
          {isCorrect ? 'Correct!' : isPartial ? 'Partial' : 'Incorrect'}
        </div>
        <span className="text-[11px] text-[#8b949e]">
          {verdict.passed_tests} / {verdict.total_tests} test cases passed
        </span>
      </div>
      
      {/* Results Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar">
        {/* Explanation */}
        <div className="explain-row text-[12.5px] leading-[1.6] text-[#8b949e]">
          <strong className="text-[#e6edf3]">Explanation</strong> — {verdict.explanation}
        </div>
        
        {/* Complexity Cards */}
        <div className="complexity-row flex gap-2.5">
          <div className="complexity-card flex-1 bg-[#1c2333] border border-[#30363d] rounded-[8px] px-3 py-2.5">
            <div className="complexity-label text-[10px] tracking-[0.8px] uppercase text-[#8b949e] mb-1">
              Time Complexity
            </div>
            <div className="complexity-val font-mono font-bold text-[17px] text-[#58a6ff]">
              {verdict.time_complexity}
            </div>
          </div>
          <div className="complexity-card flex-1 bg-[#1c2333] border border-[#30363d] rounded-[8px] px-3 py-2.5">
            <div className="complexity-label text-[10px] tracking-[0.8px] uppercase text-[#8b949e] mb-1">
              Space Complexity
            </div>
            <div className="complexity-val font-mono font-bold text-[17px] text-[#58a6ff]">
              {verdict.space_complexity}
            </div>
          </div>
        </div>
        
        {/* Test Cases */}
        <div>
          <div className="section-label text-[10px] font-bold tracking-[1px] uppercase text-[#8b949e] mb-2">
            Test Cases
          </div>
          <div className="test-cases flex gap-1.5 flex-wrap">
            {renderTestCases()}
          </div>
        </div>
        
        {/* Pattern Feedback */}
        <div className={`feedback-card rounded-[8px] px-3 py-2.5 ${isCorrect ? 'bg-[rgba(63,185,80,0.08)] border border-[rgba(63,185,80,0.25)]' : 'bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.25)]'}`}>
          <div className={`feedback-label text-[10px] tracking-[0.8px] uppercase ${isCorrect ? 'text-[#3fb950]' : 'text-[#f85149]'} mb-1`}>
            Pattern Feedback
          </div>
          <div className="feedback-text text-[12.5px] leading-[1.6] text-[#c9d1d9]">
            {verdict.pattern_feedback}
          </div>
        </div>
        
        {/* Improvement Notes */}
        {verdict.improvement_notes && (
          <div className="feedback-card bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.25)] rounded-[8px] px-3 py-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
            <div className="feedback-label text-[10px] tracking-[0.8px] uppercase text-[#f85149] mb-1">
              Improvement Notes
            </div>
            <div className="feedback-text text-[12.5px] leading-[1.6] text-[#c9d1d9] whitespace-pre-wrap">
              {verdict.improvement_notes}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex gap-3 px-3.5 py-2.5 border-t border-[#30363d] bg-[#1c2333]/50 flex-shrink-0">
        <button
          onClick={onTryAgain}
          className="flex-1 py-1.5 px-4 bg-[#161b22] border border-[#30363d] hover:bg-[#1c2333] text-[#e6edf3] rounded-[6px] font-medium text-[13px] transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onNextExercise}
          className="flex-1 py-1.5 px-4 bg-[#3fb950] hover:bg-[#3fb950]/85 text-white rounded-[6px] font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5"
        >
          Next Exercise
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[13px] h-[13px]">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
