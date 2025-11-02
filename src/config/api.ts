import { ANTHROPIC_API_KEY } from '@env';

export const API_CONFIG = {
  anthropic: {
    apiKey: ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2000,
    timeout: 30000, // 30 seconds
  },
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    quality: 0.8,
    maxWidth: 2048,
    maxHeight: 2048,
  },
} as const;

export const validateApiKey = (): boolean => {
  return Boolean(ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.length > 0);
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

