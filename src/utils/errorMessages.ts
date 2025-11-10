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
  API_KEY_MISSING = 'API_KEY_MISSING',
  OUTFIT_GENERATION = 'OUTFIT_GENERATION',
  CHAT_ERROR = 'CHAT_ERROR',
  PROFILE_SAVE_ERROR = 'PROFILE_SAVE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorContext {
  OUTFIT_GENERATION = 'OUTFIT_GENERATION',
  OUTFIT_REGENERATION = 'OUTFIT_REGENERATION',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  PHOTO_ANALYSIS = 'PHOTO_ANALYSIS',
  STYLE_CHECK = 'STYLE_CHECK',
  PROFILE_SAVE = 'PROFILE_SAVE',
  MEASUREMENTS_SAVE = 'MEASUREMENTS_SAVE',
  WARDROBE_SAVE = 'WARDROBE_SAVE',
  GENERIC = 'GENERIC',
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
  action?: 'retry' | 'navigate' | 'contact_support' | 'check_settings';
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
 * Get user-friendly error message with context
 */
export function getErrorMessage(error: unknown, context?: string | ErrorContext): ErrorInfo {
  const type = getErrorType(error);
  const errorString = error instanceof Error ? error.message : String(error);

  const baseMessages: Record<ErrorType, Omit<ErrorInfo, 'type'>> = {
    [ErrorType.NETWORK]: {
      message: errorString,
      userMessage: 'Unable to connect. Please check your internet connection and try again.',
      retryable: true,
      code: 'NETWORK_ERROR',
      action: 'retry',
    },
    [ErrorType.TIMEOUT]: {
      message: errorString,
      userMessage: 'Request took too long. Please try again.',
      retryable: true,
      code: 'TIMEOUT_ERROR',
      action: 'retry',
    },
    [ErrorType.RATE_LIMIT]: {
      message: errorString,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      code: 'RATE_LIMIT',
      action: 'retry',
    },
    [ErrorType.PERMISSION]: {
      message: errorString,
      userMessage: 'Permission denied. Please enable the required permissions in settings.',
      retryable: false,
      code: 'PERMISSION_DENIED',
      action: 'check_settings',
    },
    [ErrorType.STORAGE]: {
      message: errorString,
      userMessage: 'Unable to save data. Please check your device storage.',
      retryable: true,
      code: 'STORAGE_ERROR',
      action: 'check_settings',
    },
    [ErrorType.VALIDATION]: {
      message: errorString,
      userMessage: typeof context === 'string' ? context : 'Invalid input. Please check your information and try again.',
      retryable: false,
      code: 'VALIDATION_ERROR',
    },
    [ErrorType.API_ERROR]: {
      message: errorString,
      userMessage: 'Service temporarily unavailable. Please try again in a moment.',
      retryable: true,
      code: 'API_ERROR',
      action: 'retry',
    },
    [ErrorType.API_KEY_MISSING]: {
      message: 'ANTHROPIC_API_KEY not configured',
      userMessage: 'Configuration error. Please contact support.',
      retryable: false,
      code: 'API_KEY_MISSING',
      action: 'contact_support',
    },
    [ErrorType.OUTFIT_GENERATION]: {
      message: errorString,
      userMessage: 'Couldn\'t generate outfit. Please try again.',
      retryable: true,
      code: 'OUTFIT_GENERATION_FAILED',
      action: 'retry',
    },
    [ErrorType.CHAT_ERROR]: {
      message: errorString,
      userMessage: 'Couldn\'t send message. Please try again.',
      retryable: true,
      code: 'CHAT_ERROR',
      action: 'retry',
    },
    [ErrorType.PROFILE_SAVE_ERROR]: {
      message: errorString,
      userMessage: 'Couldn\'t save your profile. Please try again.',
      retryable: true,
      code: 'PROFILE_SAVE_ERROR',
      action: 'retry',
    },
    [ErrorType.UNKNOWN]: {
      message: errorString,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
      code: 'UNKNOWN_ERROR',
      action: 'retry',
    },
  };

  // Apply context-specific messaging
  const contextMessages: Record<ErrorContext, Partial<Omit<ErrorInfo, 'type'>>> = {
    [ErrorContext.OUTFIT_GENERATION]: {
      userMessage: type === ErrorType.NETWORK 
        ? 'Can\'t connect to generate outfit. Check your internet and try again.'
        : 'Failed to generate outfit. Please try again.',
    },
    [ErrorContext.OUTFIT_REGENERATION]: {
      userMessage: type === ErrorType.NETWORK
        ? 'Can\'t connect to regenerate item. Check your internet and try again.'
        : 'Failed to regenerate item. Please try again.',
    },
    [ErrorContext.CHAT_MESSAGE]: {
      userMessage: type === ErrorType.NETWORK
        ? 'Can\'t send message. Check your internet and try again.'
        : 'Failed to send message. Please try again.',
    },
    [ErrorContext.PHOTO_ANALYSIS]: {
      userMessage: type === ErrorType.NETWORK
        ? 'Can\'t analyze photo. Check your internet and try again.'
        : 'Failed to analyze photo. Please try again.',
    },
    [ErrorContext.STYLE_CHECK]: {
      userMessage: type === ErrorType.NETWORK
        ? 'Can\'t perform style check. Check your internet and try again.'
        : 'Style check failed. Please try again.',
    },
    [ErrorContext.PROFILE_SAVE]: {
      userMessage: type === ErrorType.STORAGE
        ? 'Couldn\'t save profile. Check device storage and try again.'
        : 'Failed to save profile. Please try again.',
    },
    [ErrorContext.MEASUREMENTS_SAVE]: {
      userMessage: type === ErrorType.STORAGE
        ? 'Couldn\'t save measurements. Check device storage and try again.'
        : 'Failed to save measurements. Please try again.',
    },
    [ErrorContext.WARDROBE_SAVE]: {
      userMessage: type === ErrorType.STORAGE
        ? 'Couldn\'t save item to wardrobe. Check device storage and try again.'
        : 'Failed to save to wardrobe. Please try again.',
    },
    [ErrorContext.GENERIC]: {},
  };

  const baseInfo = baseMessages[type];
  const contextInfo = typeof context === 'string' && Object.values(ErrorContext).includes(context as ErrorContext)
    ? contextMessages[context as ErrorContext]
    : {};

  return {
    type,
    ...baseInfo,
    ...contextInfo,
  };
}

/**
 * Get context-specific error message for common scenarios
 */
export function getContextualError(error: unknown, context: ErrorContext): ErrorInfo {
  return getErrorMessage(error, context);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return getErrorMessage(error).retryable;
}

