import { useState } from 'react';
import { config } from '../config';

interface LLMResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
}

export function useLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const callLLM = async <T,>(prompt: string, systemPrompt?: string, retryOptions?: RetryOptions): Promise<LLMResponse<T>> => {
    const options: Required<RetryOptions> = { 
      maxRetries: 3, 
      baseDelay: 1000, 
      ...retryOptions 
    };
    const { maxRetries, baseDelay } = options;
    
    setIsLoading(true);
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          }),
        });

        if (!response.ok) {
          if (response.status >= 500 && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            setRetryCount(attempt + 1);
            continue;
          }
          throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content) as T;
        return {
          success: true,
          data: parsedData,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          setRetryCount(attempt + 1);
          continue;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
    };
  };

  return { callLLM, isLoading, retryCount };
}
