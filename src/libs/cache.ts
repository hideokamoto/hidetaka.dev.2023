/**
 * Cache control utilities for API responses
 * Provides standard cache headers for Cloudflare Workers and CDN
 */

export type CacheStrategy = 'immutable' | 'short' | 'medium' | 'long' | 'stale-while-revalidate'

export type CacheHeaders = Record<string, string>

/**
 * Get cache headers for immutable content (content that never changes)
 * Recommended for: Content identified by hash/ID that is guaranteed to be unique
 *
 * @param maxAge - Cache duration in seconds (default: 1 year)
 * @returns Cache control headers
 *
 * @example
 * ```ts
 * // For thumbnails based on post ID (content won't change)
 * const headers = getImmutableCacheHeaders()
 * ```
 */
export function getImmutableCacheHeaders(maxAge = 31536000): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}, immutable`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Cloudflare-CDN-Cache-Control': `public, max-age=${maxAge}`,
  }
}

/**
 * Get cache headers for short-lived content
 * Recommended for: Frequently updated content
 *
 * @param maxAge - Cache duration in seconds (default: 5 minutes)
 * @returns Cache control headers
 */
export function getShortCacheHeaders(maxAge = 300): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
  }
}

/**
 * Get cache headers for medium-lived content
 * Recommended for: Semi-static content that changes occasionally
 *
 * @param maxAge - Cache duration in seconds (default: 1 hour)
 * @returns Cache control headers
 */
export function getMediumCacheHeaders(maxAge = 3600): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
  }
}

/**
 * Get cache headers for long-lived content
 * Recommended for: Mostly static content
 *
 * @param maxAge - Cache duration in seconds (default: 1 day)
 * @returns Cache control headers
 */
export function getLongCacheHeaders(maxAge = 86400): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
  }
}

/**
 * Get cache headers with stale-while-revalidate strategy
 * Recommended for: Content that needs to be fresh but can tolerate brief staleness
 *
 * @param maxAge - Cache duration in seconds (default: 1 hour)
 * @param staleWhileRevalidate - Stale duration in seconds (default: 1 day)
 * @returns Cache control headers
 *
 * @example
 * ```ts
 * // Cache for 1 hour, but serve stale for up to 1 day while revalidating
 * const headers = getStaleWhileRevalidateHeaders(3600, 86400)
 * ```
 */
export function getStaleWhileRevalidateHeaders(
  maxAge = 3600,
  staleWhileRevalidate = 86400,
): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}

/**
 * Get cache headers based on strategy name
 *
 * @param strategy - Cache strategy to use
 * @returns Cache control headers
 *
 * @example
 * ```ts
 * const headers = getCacheHeaders('immutable')
 * ```
 */
export function getCacheHeaders(strategy: CacheStrategy = 'medium'): CacheHeaders {
  switch (strategy) {
    case 'immutable':
      return getImmutableCacheHeaders()
    case 'short':
      return getShortCacheHeaders()
    case 'medium':
      return getMediumCacheHeaders()
    case 'long':
      return getLongCacheHeaders()
    case 'stale-while-revalidate':
      return getStaleWhileRevalidateHeaders()
    default:
      return getMediumCacheHeaders()
  }
}

/**
 * Get no-cache headers (disable caching)
 * Recommended for: Dynamic content that should never be cached
 *
 * @returns Cache control headers
 */
export function getNoCacheHeaders(): CacheHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }
}
