/**
 * Rate limiting utility for API routes
 * Cloudflare Workers compatible implementation
 */

import { logger } from './logger'

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

type RateLimitOptions = {
  limit?: number // Default: 30 requests
  window?: number // Default: 60 seconds
}

/**
 * In-memory rate limit storage for development and as fallback
 * In production, this could be replaced with Cloudflare KV or Durable Objects
 */
class InMemoryRateLimitStore {
  private store: Map<
    string,
    {
      count: number
      resetTime: number
    }
  >
  private cleanupInterval: NodeJS.Timeout | null

  constructor() {
    this.store = new Map()
    this.cleanupInterval = null
    this.startCleanup()
  }

  /**
   * Clean up expired entries every 60 seconds
   */
  private startCleanup() {
    // Only run cleanup in Node.js environment (not in Workers)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        const now = Date.now()
        for (const [key, value] of this.store.entries()) {
          if (value.resetTime < now) {
            this.store.delete(key)
          }
        }
      }, 60 * 1000)
    }
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const existing = this.store.get(key)

    // If no existing entry or expired, create new
    if (!existing || existing.resetTime < now) {
      const resetTime = now + windowMs
      this.store.set(key, { count: 1, resetTime })
      return { count: 1, resetTime }
    }

    // Increment existing count
    existing.count += 1
    this.store.set(key, existing)
    return existing
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Global instance for in-memory storage
const inMemoryStore = new InMemoryRateLimitStore()

/**
 * Get identifier for rate limiting from request
 * Uses IP address or falls back to 'unknown'
 */
function getIdentifier(request: Request): string {
  // Cloudflare Workers: CF-Connecting-IP header
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback: X-Forwarded-For header
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Fallback: X-Real-IP header
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  logger.warn('Rate limit identifier fallback to unknown', {
    headers: Object.fromEntries(request.headers.entries()),
  })

  return 'unknown'
}

/**
 * Check rate limit for a request
 *
 * @param request - The incoming request
 * @param options - Rate limit configuration
 * @returns Rate limit result with success status and headers info
 *
 * @example
 * ```ts
 * const result = await checkRateLimit(request, { limit: 30, window: 60 })
 * if (!result.success) {
 *   return new Response('Too Many Requests', { status: 429 })
 * }
 * ```
 */
export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const limit = options.limit ?? 30
  const window = options.window ?? 60
  const windowMs = window * 1000

  const identifier = getIdentifier(request)
  const key = `ratelimit:${identifier}`

  try {
    // Use in-memory store for now
    // TODO: Replace with Cloudflare KV or Durable Objects for production
    const { count, resetTime } = inMemoryStore.increment(key, windowMs)

    const success = count <= limit
    const remaining = Math.max(0, limit - count)

    if (!success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        count,
        limit,
        resetTime: new Date(resetTime).toISOString(),
      })
    }

    return {
      success,
      limit,
      remaining,
      reset: resetTime,
    }
  } catch (error) {
    // On error, allow the request but log the issue
    logger.error('Rate limit check failed, allowing request', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier,
    })

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowMs,
    }
  }
}

/**
 * Cleanup function for testing
 * @internal
 */
export function cleanupRateLimitStore() {
  inMemoryStore.cleanup()
}
