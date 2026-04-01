import React from 'react';

interface ActionBarProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  onSubmit,
  isSubmitting = false 
}) => {
  return (
    <div className="flex items-center justify-end gap-3 mt-6">
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors flex items-center gap-2 ${
          isSubmitting
            ? 'bg-green-600/50 text-green-200 cursor-wait'
            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'
        }`}
      >
        <span>✓ Submit Solution</span>
      </button>
    </div>
  );
};
