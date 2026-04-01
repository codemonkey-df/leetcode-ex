import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';

type Difficulty = 'basic' | 'intermediate' | 'advanced';

export const WelcomeScreen: React.FC = () => {
  const { setDifficulty } = useSession();
  const [apiBase, setApiBase] = useState(() => {
    const fromStorage = localStorage.getItem('VITE_LLM_API_BASE');
    const fromEnv = (import.meta as any).env.VITE_LLM_API_BASE;
    return fromStorage || fromEnv || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    const fromStorage = localStorage.getItem('VITE_LLM_API_KEY');
    const fromEnv = (import.meta as any).env.VITE_LLM_API_KEY;
    return fromStorage || fromEnv || '';
  });
  const [model, setModel] = useState(() => {
    const fromStorage = localStorage.getItem('VITE_LLM_MODEL');
    const fromEnv = (import.meta as any).env.VITE_LLM_MODEL;
    return fromStorage || fromEnv || '';
  });
  const [isConfigOpen, setIsConfigOpen] = useState(() => {
    const fromStorage = localStorage.getItem('VITE_LLM_API_BASE');
    const fromEnv = (import.meta as any).env.VITE_LLM_API_BASE;
    // Show config panel if no valid config is available
    return !(fromStorage && fromStorage !== 'your-api-key-here' && fromStorage !== 'your-api-key' && fromStorage !== '') &&
           !fromEnv;
  });

  // Update localStorage when values change (config module reads from localStorage)
  const handleConfigChange = () => {
    localStorage.setItem('VITE_LLM_API_BASE', apiBase);
    localStorage.setItem('VITE_LLM_API_KEY', apiKey);
    localStorage.setItem('VITE_LLM_MODEL', model);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    // Save config before proceeding
    handleConfigChange();
    setDifficulty(difficulty);
  };

  // Just update localStorage - config getter picks it up immediately
  const handleSaveConfig = () => {
    handleConfigChange();
    setIsConfigOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Config Panel - Collapsible */}
        <div className="mb-8">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="text-sm text-cyan-400 hover:text-cyan-300 mb-4 flex items-center justify-center gap-2 w-full"
          >
            {isConfigOpen ? '▼' : '▲'} Configure LLM Settings
          </button>
          
          {isConfigOpen && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                LLM Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value={apiBase}
                    onChange={(e) => setApiBase(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                    placeholder="http://localhost:8765/v1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                    placeholder="your-api-key-here"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                    placeholder="qwen3-coder-nextQ8"
                    required
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveConfig}
                className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm"
              >
                Save Configuration
              </button>
            </div>
          )}
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
          LeetCode <span className="text-cyan-400">Patterns</span> Tutor
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-lg mx-auto">
          Master algorithmic problem-solving through guided, AI-powered exercises
        </p>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Select Your Difficulty
          </h2>
          
          <button
            onClick={() => handleDifficultySelect('basic')}
            className="w-full p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-green-500 hover:bg-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                  Basic
                </h3>
                <p className="text-slate-400 mt-1">
                  Single-pattern problems • 5-15 min
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                1
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleDifficultySelect('intermediate')}
            className="w-full p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-yellow-500 hover:bg-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                  Intermediate
                </h3>
                <p className="text-slate-400 mt-1">
                  Multi-pattern problems • 15-30 min
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                2
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleDifficultySelect('advanced')}
            className="w-full p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-red-500 hover:bg-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                  Advanced
                </h3>
                <p className="text-slate-400 mt-1">
                  Complex problems • 30-60 min
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                3
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
