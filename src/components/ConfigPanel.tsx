import React, { useState } from 'react';
import { config } from '../config';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ isOpen, onClose }) => {
  const [apiBase, setApiBase] = useState(config.llmApiBase);
  const [apiKey, setApiKey] = useState(config.llmApiKey);
  const [model, setModel] = useState(config.llmModel);

  const handleSave = () => {
    // Update config - in real app this would persist to localStorage or similar
    console.log('Updated config:', { apiBase, apiKey, model });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-40 w-80 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-cyan-100">LLM Configuration</h3>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">API Base URL</label>
          <input
            type="text"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="http://192.168.1.201:7654/v1"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="lxc-pretbc"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="openai/gemma-3n"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};
