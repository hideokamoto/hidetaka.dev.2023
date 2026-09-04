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

type WaitUntilContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

type CacheContext = WaitUntilContext | { ctx: WaitUntilContext }

const DEFAULT_TTL = 31536000 // 1 year
const ONE_DAY = 86400 // 24 hours

function isCacheAvailable(): boolean {
  return typeof caches !== 'undefined' && 'default' in caches
}

function getDefaultCache(): Cache | null {
  if (!isCacheAvailable()) {
    return null
  }

  return (caches as CloudflareCacheStorage).default
}

/**
 * Cache keys must be GET requests and should not include auth headers.
 */
export function createCacheKey(request: Request): Request {
  return new Request(request.url, { method: 'GET' })
}

function resolveWaitUntil(context: CacheContext): ((promise: Promise<unknown>) => void) | null {
  if ('waitUntil' in context && typeof context.waitUntil === 'function') {
    return context.waitUntil.bind(context)
  }

  if ('ctx' in context && typeof context.ctx.waitUntil === 'function') {
    return context.ctx.waitUntil.bind(context.ctx)
  }

  return null
}

function storeInCache(
  cache: Cache,
  cacheKey: Request,
  response: Response,
  context?: CacheContext,
): void {
  const putPromise = cache.put(cacheKey, response.clone())

  const waitUntil = context ? resolveWaitUntil(context) : null
  if (waitUntil) {
    waitUntil(putPromise)
    return
  }

  putPromise.catch((error) => {
    logger.warn('Failed to cache response', { url: cacheKey.url, error })
  })
}

function formatCacheError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function prepareCachedResponse(response: Response, ttl: number, immutable: boolean): Response {
  const responseHeaders = new Headers(response.headers)

  const cacheControl = `public, max-age=${ttl}, s-maxage=${ttl}${immutable ? ', immutable' : ''}`
  responseHeaders.set('Cache-Control', cacheControl)
  responseHeaders.set('CDN-Cache-Control', `public, max-age=${ttl}`)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

/**
 * Get cached response or execute callback and cache the result
 *
 * @param request - The incoming request (used to generate cache key from request.url)
 * @param callback - Function to generate response if cache miss
 * @param options - Cache options (TTL, immutable flag)
 * @returns Cached or freshly generated response
 */
export async function withCache(
  request: Request,
  callback: () => Promise<Response>,
  options: CacheOptions = {},
): Promise<Response> {
  const cache = getDefaultCache()
  if (!cache) {
    return callback()
  }

  const { ttl = DEFAULT_TTL, immutable = ttl >= ONE_DAY } = options

  try {
    const cacheKey = createCacheKey(request)

    const cached = await cache.match(cacheKey)
    if (cached) {
      logger.log('Cache hit', { url: request.url })
      return cached
    }

    logger.log('Cache miss', { url: request.url })

    const response = await callback()

    if (!response.ok) {
      return response
    }

    const responseToCache = prepareCachedResponse(response, ttl, immutable)
    storeInCache(cache, cacheKey, responseToCache)

    return responseToCache
  } catch (error) {
    logger.warn('Cache operation failed, falling back to uncached response', {
      url: request.url,
      error: formatCacheError(error),
    })
    return callback()
  }
}

/**
 * Get cached response or execute callback with Cloudflare context
 * This version supports waitUntil for proper cache storage
 *
 * @param request - The incoming request
 * @param ctx - Cloudflare ExecutionContext or OpenNext CloudflareContext
 * @param callback - Function to generate response if cache miss
 * @param options - Cache options
 * @returns Cached or freshly generated response
 */
export async function withCacheAndContext(
  request: Request,
  ctx: CacheContext,
  callback: () => Promise<Response>,
  options: CacheOptions = {},
): Promise<Response> {
  const cache = getDefaultCache()
  if (!cache) {
    return callback()
  }

  const { ttl = DEFAULT_TTL, immutable = ttl >= ONE_DAY } = options

  try {
    const cacheKey = createCacheKey(request)

    const cached = await cache.match(cacheKey)
    if (cached) {
      logger.log('Cache hit', { url: request.url })
      return cached
    }

    logger.log('Cache miss', { url: request.url })

    const response = await callback()

    if (!response.ok) {
      return response
    }

    const responseToCache = prepareCachedResponse(response, ttl, immutable)
    storeInCache(cache, cacheKey, responseToCache, ctx)

    return responseToCache
  } catch (error) {
    logger.warn('Cache operation failed, falling back to uncached response', {
      url: request.url,
      error: formatCacheError(error),
    })
    return callback()
  }
}
