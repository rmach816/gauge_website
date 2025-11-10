/**
 * API Response Cache
 * Caches API responses to reduce redundant calls and improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from request parameters
   */
  private generateKey(request: any): string {
    // Create a stable key from request parameters
    const keyParts = [
      request.requestType,
      request.occasion,
      request.stylePreference,
      request.priceRange,
      request.garmentTypeToRegenerate,
      JSON.stringify(request.wardrobeItems?.map((item: any) => item.id).sort()),
      JSON.stringify(request.imageBase64?.length || 0),
    ].filter(Boolean);
    
    return keyParts.join('|');
  }

  /**
   * Get cached response if available and not expired
   */
  get<T>(request: any): T | null {
    const key = this.generateKey(request);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store response in cache
   */
  set<T>(request: any, data: T, ttl: number = this.DEFAULT_TTL): void {
    const key = this.generateKey(request);
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(request: any): void {
    const key = this.generateKey(request);
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Clean expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiCache.cleanExpired();
  }, 10 * 60 * 1000);
}

