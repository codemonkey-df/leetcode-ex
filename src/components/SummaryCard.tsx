import React from 'react';

interface SummaryCardProps {
  summary: string;
  patternTip: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, patternTip }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-bold text-white">Pattern Summary</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 leading-relaxed">{summary}</p>
        </div>
        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-cyan-400">💡</div>
            <div>
              <h4 className="text-cyan-400 font-semibold text-sm mb-1">Pattern Tip</h4>
              <p className="text-cyan-100/80 text-sm leading-relaxed">{patternTip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
