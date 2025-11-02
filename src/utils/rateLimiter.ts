import { StorageService } from '../services/storage';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limiting service to prevent API abuse
 */
export const RateLimiter = {
  /**
   * Check if action is allowed based on rate limit
   * @param key - Unique identifier for the rate limit (e.g., 'api-calls', 'photo-uploads')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   */
  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const storageKey = `@rate_limit_${key}`;
    const now = Date.now();

    try {
      // Simple in-memory rate limiting (resets on app restart)
      // In production, consider using AsyncStorage for persistence
      const cacheKey = `rateLimit_${key}`;
      const globalCache = global as typeof global & { [key: string]: RateLimitEntry | undefined };
      const cached = globalCache[cacheKey];

      if (!cached || now > cached.resetTime) {
        // Reset or initialize
        globalCache[cacheKey] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: now + windowMs,
        };
      }

      if (cached.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: cached.resetTime,
        };
      }

      cached.count += 1;
      return {
        allowed: true,
        remaining: maxRequests - cached.count,
        resetAt: cached.resetTime,
      };
    } catch (error) {
      console.error('[RateLimiter] Error checking rate limit:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now + windowMs,
      };
    }
  },

  /**
   * Check rate limit for API calls (5 calls per minute)
   */
  async checkApiRateLimit(): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    return this.checkRateLimit('api-calls', 5, 60000); // 5 per minute
  },
};

