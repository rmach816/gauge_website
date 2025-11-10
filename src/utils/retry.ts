/**
 * Retry utility with exponential backoff
 * Retries a function with increasing delays between attempts
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryableErrors'>> & { retryableErrors?: (error: any) => boolean } = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
    return true;
  }
  
  // HTTP status codes that are retryable
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }
  
  // Rate limiting (429)
  if (error?.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const retryable = options.retryableErrors || isRetryableError;
  
  let lastError: any;
  let delay = opts.initialDelay;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!retryable(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }
  
  throw lastError;
}

