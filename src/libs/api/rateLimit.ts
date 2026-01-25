/**
 * Rate limiting middleware for API routes
 *
 * Provides simple in-memory rate limiting based on IP address.
 * For production use with Cloudflare Workers, consider using:
 * - Cloudflare Rate Limiting (built-in service)
 * - Durable Objects for distributed rate limiting
 * - KV for persistent rate limiting across edge locations
 */

import { logger } from '@/libs/logger'

type RateLimitConfig = {
  /**
   * Maximum number of requests allowed per window
   */
  maxRequests: number
  /**
   * Time window in seconds
   */
  windowSeconds: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

// In-memory store for rate limiting (per Worker instance)
// Note: This is not shared across edge locations or Worker instances
const rateLimitStore = new Map<string, RateLimitEntry>()

// Default rate limit: 60 requests per minute
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
}

/**
 * Get client identifier from request (IP address)
 */
function getClientId(request: Request): string {
  // Try to get real IP from Cloudflare headers
  const cfConnectingIp = request.headers.get('CF-Connecting-IP')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to X-Forwarded-For
  const xForwardedFor = request.headers.get('X-Forwarded-For')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  // Last resort: use URL as identifier (not ideal)
  return new URL(request.url).pathname
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check if request is rate limited
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns null if allowed, Response with 429 status if rate limited
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<Response | null> {
  const clientId = getClientId(request)
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  // Periodic cleanup (10% chance)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries()
  }

  let entry = rateLimitStore.get(clientId)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(clientId, entry)
    logger.log('Rate limit check', {
      clientId,
      count: 1,
      limit: config.maxRequests,
      resetIn: config.windowSeconds,
    })
    return null
  }

  // Increment count
  entry.count += 1

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    logger.warn('Rate limit exceeded', {
      clientId,
      count: entry.count,
      limit: config.maxRequests,
      retryAfter,
    })

    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(entry.resetAt / 1000).toString(),
        },
      },
    )
  }

  logger.log('Rate limit check', {
    clientId,
    count: entry.count,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
  })

  return null
}

/**
 * Wrapper function to apply rate limiting to API routes
 *
 * @param request - The incoming request
 * @param handler - The API route handler function
 * @param config - Rate limit configuration
 * @returns Response from handler or rate limit error
 */
export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<Response> {
  const rateLimitResponse = await checkRateLimit(request, config)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return handler()
}
