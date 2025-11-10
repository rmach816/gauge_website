/**
 * Error Message Utilities
 * Provides user-friendly error messages for different error types
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
}

/**
 * Extract error type from error object
 */
export function getErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  const errorString = error instanceof Error ? error.message : String(error);

  // Network errors
  if (
    errorString.includes('Network request failed') ||
    errorString.includes('network') ||
    errorString.includes('ECONNREFUSED') ||
    errorString.includes('ENOTFOUND') ||
    errorString.includes('fetch')
  ) {
    return ErrorType.NETWORK;
  }

  // Timeout errors
  if (
    errorString.includes('timeout') ||
    errorString.includes('TIMEOUT') ||
    errorString.includes('ETIMEDOUT')
  ) {
    return ErrorType.TIMEOUT;
  }

  // Rate limit errors
  if (
    errorString.includes('rate limit') ||
    errorString.includes('429') ||
    errorString.includes('too many requests')
  ) {
    return ErrorType.RATE_LIMIT;
  }

  // Permission errors
  if (
    errorString.includes('permission') ||
    errorString.includes('PERMISSION') ||
    errorString.includes('denied')
  ) {
    return ErrorType.PERMISSION;
  }

  // Storage errors
  if (
    errorString.includes('storage') ||
    errorString.includes('AsyncStorage') ||
    errorString.includes('ENOSPC')
  ) {
    return ErrorType.STORAGE;
  }

  // Validation errors
  if (
    errorString.includes('validation') ||
    errorString.includes('invalid') ||
    errorString.includes('required')
  ) {
    return ErrorType.VALIDATION;
  }

  // API errors (4xx, 5xx)
  if (
    errorString.includes('400') ||
    errorString.includes('401') ||
    errorString.includes('403') ||
    errorString.includes('404') ||
    errorString.includes('500') ||
    errorString.includes('502') ||
    errorString.includes('503')
  ) {
    return ErrorType.API_ERROR;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown, context?: string): ErrorInfo {
  const type = getErrorType(error);
  const errorString = error instanceof Error ? error.message : String(error);

  const messages: Record<ErrorType, Omit<ErrorInfo, 'type'>> = {
    [ErrorType.NETWORK]: {
      message: errorString,
      userMessage: 'Unable to connect. Please check your internet connection and try again.',
      retryable: true,
      code: 'NETWORK_ERROR',
    },
    [ErrorType.TIMEOUT]: {
      message: errorString,
      userMessage: 'Request took too long. Please try again.',
      retryable: true,
      code: 'TIMEOUT_ERROR',
    },
    [ErrorType.RATE_LIMIT]: {
      message: errorString,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      code: 'RATE_LIMIT',
    },
    [ErrorType.PERMISSION]: {
      message: errorString,
      userMessage: 'Permission denied. Please enable the required permissions in settings.',
      retryable: false,
      code: 'PERMISSION_DENIED',
    },
    [ErrorType.STORAGE]: {
      message: errorString,
      userMessage: 'Unable to save data. Please check your device storage.',
      retryable: true,
      code: 'STORAGE_ERROR',
    },
    [ErrorType.VALIDATION]: {
      message: errorString,
      userMessage: context || 'Invalid input. Please check your information and try again.',
      retryable: false,
      code: 'VALIDATION_ERROR',
    },
    [ErrorType.API_ERROR]: {
      message: errorString,
      userMessage: 'Service temporarily unavailable. Please try again in a moment.',
      retryable: true,
      code: 'API_ERROR',
    },
    [ErrorType.UNKNOWN]: {
      message: errorString,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
      code: 'UNKNOWN_ERROR',
    },
  };

  return {
    type,
    ...messages[type],
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return getErrorMessage(error).retryable;
}

