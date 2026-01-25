/**
 * Common API handler utilities
 * Provides rate limiting, error handling, and standardized responses
 */

import { logger } from '@/libs/logger'
import type { RateLimitResult } from '@/libs/ratelimit'
import { checkRateLimit } from '@/libs/ratelimit'

export type ApiHandlerOptions = {
  rateLimit?: {
    limit?: number
    window?: number
  }
  skipRateLimit?: boolean
}

/**
 * Wrap an API handler with rate limiting
 *
 * @param request - The incoming request
 * @param handler - The API handler function to execute
 * @param options - Configuration options
 * @returns Response with rate limit headers
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withRateLimit(request, async () => {
 *     // Your API logic here
 *     return new Response('OK', { status: 200 })
 *   }, {
 *     rateLimit: { limit: 30, window: 60 }
 *   })
 * }
 * ```
 */
export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  options: ApiHandlerOptions = {},
): Promise<Response> {
  let rateLimitResult: RateLimitResult | null = null

  // Check rate limit unless explicitly skipped
  if (!options.skipRateLimit) {
    rateLimitResult = await checkRateLimit(request, options.rateLimit)

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

      logger.warn('Rate limit exceeded, returning 429', {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        reset: new Date(rateLimitResult.reset).toISOString(),
        retryAfter,
      })

      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      })
    }
  }

  try {
    const response = await handler()

    // Add rate limit headers to successful response
    if (rateLimitResult) {
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    }

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error('API handler error', {
      error: errorMessage,
      path: new URL(request.url).pathname,
      method: request.method,
    })

    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}

/**
 * Create a standardized error response
 *
 * @param status - HTTP status code
 * @param message - Error message
 * @param details - Optional additional details
 * @returns Error response
 *
 * @example
 * ```ts
 * return createErrorResponse(400, 'Invalid request', { field: 'id' })
 * ```
 */
export function createErrorResponse(
  status: number,
  message: string,
  details?: Record<string, unknown>,
): Response {
  const body = JSON.stringify({
    error: message,
    ...(details && { details }),
  })

  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Create a standardized success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers
 * @returns Success response
 *
 * @example
 * ```ts
 * return createSuccessResponse({ result: 'ok' })
 * ```
 */
export function createSuccessResponse(
  data: unknown,
  status = 200,
  headers?: Record<string, string>,
): Response {
  const body = JSON.stringify(data)

  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}
