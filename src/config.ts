import { Config } from './types';

// Helper to get config value with localStorage fallback at runtime
// Falls back to import.meta.env (Vite env vars) if localStorage is empty
const getConfigValue = (key: string, envName: string): string => {
  // Check localStorage first (for runtime changes from WelcomeScreen)
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored && stored !== '' && stored !== 'your-api-key-here' && stored !== 'your-api-key') {
      return stored;
    }
  }
  // Fall back to Vite env var
  const envValue = (import.meta as any).env[envName];
  if (envValue !== undefined && envValue !== '' && envValue !== 'your-api-key-here' && envValue !== 'your-api-key') {
    return envValue;
  }
  // If still no valid value, return empty string - the API call will fail gracefully
  return '';
};

export const config = {
  get llmApiBase() { return getConfigValue('VITE_LLM_API_BASE', 'VITE_LLM_API_BASE'); },
  get llmApiKey() { return getConfigValue('VITE_LLM_API_KEY', 'VITE_LLM_API_KEY'); },
  get llmModel() { return getConfigValue('VITE_LLM_MODEL', 'VITE_LLM_MODEL'); },
};
