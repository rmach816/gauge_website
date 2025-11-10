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
  onRetry?: (attempt: number, error: any) => void;
  onFinalFailure?: (error: any) => void;
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
      
      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, error);
      }
      
      console.log(`[Retry] Attempt ${attempt}/${opts.maxAttempts} failed, retrying in ${delay}ms...`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }
  
  // Call onFinalFailure callback if provided
  if (options.onFinalFailure) {
    options.onFinalFailure(lastError);
  }
  
  console.error(`[Retry] All ${opts.maxAttempts} attempts failed:`, lastError);
  throw lastError;
}

/**
 * Convenience wrapper with sensible defaults for API calls
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  return retryWithBackoff(fn, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`[${context || 'API'}] Retry attempt ${attempt}:`, error.message);
    },
  });
}

