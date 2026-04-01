import React from 'react';

interface PatternModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatternModal: React.FC<PatternModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="h-[48px] flex items-center justify-between px-5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors p-1 rounded-[6px] hover:bg-[#1c2333]"
            title="Close and return to exercise"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
          <div className="flex items-center gap-2.5 font-bold text-[15px]">
            <div className="bg-[#58a6ff] text-white rounded-[6px] w-[26px] h-[26px] flex items-center justify-center text-[12px] font-bold">
              LC
            </div>
            Patterns Tutor — Algorithm Explainer
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-[#1c2333] border border-[#30363d] rounded-[7px] px-3 py-1 text-[12px] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#444c56] transition-all"
        >
          ← Back to Exercise
        </button>
      </div>

      {/* Visualization Content (iframe) */}
      <div className="flex-1 overflow-hidden relative bg-[#0d1117]">
        <iframe
          src="/patterns_visio.html"
          className="w-full h-full border-none"
          title="Pattern Visualization"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
        />
      </div>
    </div>
  );
};
