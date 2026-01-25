/**
 * Cloudflare Cache API wrapper for efficient caching
 *
 * Provides utilities for caching responses using Cloudflare's Cache API.
 * Cache TTL is controlled via Cache-Control headers.
 */

import { logger } from '@/libs/logger'

/**
 * Cloudflare-specific Cache interface
 * Cloudflare Workers extends the standard CacheStorage with a 'default' cache
 */
interface CloudflareCacheStorage extends CacheStorage {
  default: Cache
}

export type CacheOptions = {
  /**
   * Cache TTL in seconds (default: 1 year)
   * This sets both max-age and s-maxage in Cache-Control header
   */
  ttl?: number
  /**
   * Whether the cache is immutable (default: true for long TTL)
   */
  immutable?: boolean
}

const DEFAULT_TTL = 31536000 // 1 year
const ONE_DAY = 86400 // 24 hours

/**
 * Get cached response or execute callback and cache the result
 *
 * @param request - The incoming request
 * @param cacheKey - Optional custom cache key (defaults to request.url)
 * @param callback - Function to generate response if cache miss
 * @param options - Cache options
 * @returns Cached or freshly generated response
 */
export async function withCache(
  request: Request,
  callback: () => Promise<Response>,
  options: CacheOptions = {},
): Promise<Response> {
  const { ttl = DEFAULT_TTL, immutable = ttl >= ONE_DAY } = options

  try {
    const cache = (caches as CloudflareCacheStorage).default
    const cacheKey = new Request(request.url, request)

    // Check cache first
    const cached = await cache.match(cacheKey)
    if (cached) {
      logger.log('Cache hit', { url: request.url })
      return cached
    }

    logger.log('Cache miss', { url: request.url })

    // Generate fresh response
    const response = await callback()

    // Only cache successful responses
    if (!response.ok) {
      return response
    }

    // Clone response and add cache headers
    const responseHeaders = new Headers(response.headers)

    // Set Cache-Control for both browser and CDN
    const cacheControl = `public, max-age=${ttl}, s-maxage=${ttl}${immutable ? ', immutable' : ''}`
    responseHeaders.set('Cache-Control', cacheControl)

    // Cloudflare-specific cache control
    responseHeaders.set('CDN-Cache-Control', `public, max-age=${ttl}`)

    const responseToCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

    // Store in cache asynchronously (non-blocking)
    // Note: We can't use waitUntil in this context, so we use a fire-and-forget promise
    cache.put(cacheKey, responseToCache.clone()).catch((error) => {
      logger.error('Failed to cache response', { url: request.url, error })
    })

    return responseToCache
  } catch (error) {
    logger.error('Cache operation failed', { url: request.url, error })
    // Fallback to callback if cache operation fails
    return callback()
  }
}

/**
 * Get cached response or execute callback with Cloudflare context
 * This version supports waitUntil for proper cache storage
 *
 * @param request - The incoming request
 * @param ctx - Cloudflare context with waitUntil
 * @param callback - Function to generate response if cache miss
 * @param options - Cache options
 * @returns Cached or freshly generated response
 */
export async function withCacheAndContext(
  request: Request,
  ctx: { waitUntil: (promise: Promise<unknown>) => void },
  callback: () => Promise<Response>,
  options: CacheOptions = {},
): Promise<Response> {
  const { ttl = DEFAULT_TTL, immutable = ttl >= ONE_DAY } = options

  try {
    const cache = (caches as CloudflareCacheStorage).default
    const cacheKey = new Request(request.url, request)

    // Check cache first
    const cached = await cache.match(cacheKey)
    if (cached) {
      logger.log('Cache hit', { url: request.url })
      return cached
    }

    logger.log('Cache miss', { url: request.url })

    // Generate fresh response
    const response = await callback()

    // Only cache successful responses
    if (!response.ok) {
      return response
    }

    // Clone response and add cache headers
    const responseHeaders = new Headers(response.headers)

    // Set Cache-Control for both browser and CDN
    const cacheControl = `public, max-age=${ttl}, s-maxage=${ttl}${immutable ? ', immutable' : ''}`
    responseHeaders.set('Cache-Control', cacheControl)

    // Cloudflare-specific cache control
    responseHeaders.set('CDN-Cache-Control', `public, max-age=${ttl}`)

    const responseToCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

    // Store in cache asynchronously using waitUntil
    ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()))

    return responseToCache
  } catch (error) {
    logger.error('Cache operation failed', { url: request.url, error })
    // Fallback to callback if cache operation fails
    return callback()
  }
}
