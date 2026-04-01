import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface MonacoWrapperProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const MonacoWrapper: React.FC<MonacoWrapperProps> = ({ 
  value, 
  onChange, 
  readOnly = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for monaco to be fully loaded
    const loadMonaco = async () => {
      try {
        const monaco = await import('monaco-editor');
        console.log('Monaco loaded:', typeof monaco);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Monaco:', error);
        setIsLoaded(true); // Still render, just without Monaco
      }
    };
    loadMonaco();
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center bg-slate-900">
        <span className="text-slate-500">Loading code editor...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-700 shadow-inner">
      <Editor
        height="100%"
        defaultLanguage="python"
        language="python"
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange?.(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 24,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          formatOnType: false,
          formatOnPaste: false,
          automaticLayout: true,
          readOnly,
        }}
      />
    </div>
  );
};
