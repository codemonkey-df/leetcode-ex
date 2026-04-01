import { describe, it, expect } from 'vitest';
import { config } from './config';

describe('config', () => {
  it('should have valid config values from environment', () => {
    // Test that config reads from environment variables correctly
    // The actual values depend on what's set in the environment
    expect(config.llmApiBase).toBeDefined();
    expect(config.llmApiKey).toBeDefined();
    expect(config.llmModel).toBeDefined();
    
    // Verify the values are valid non-empty strings
    expect(typeof config.llmApiBase).toBe('string');
    expect(typeof config.llmApiKey).toBe('string');
    expect(typeof config.llmModel).toBe('string');
    
    expect(config.llmApiBase.length).toBeGreaterThan(0);
    expect(config.llmApiKey.length).toBeGreaterThan(0);
    expect(config.llmModel.length).toBeGreaterThan(0);
  });
});
