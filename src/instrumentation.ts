/**
 * Next.js Instrumentation
 * Loads Sentry configuration based on runtime environment
 *
 * This file is automatically executed by Next.js when the server starts.
 * It conditionally imports the appropriate Sentry config for each runtime:
 * - Edge runtime (Cloudflare Workers): sentry.edge.config.ts
 * - Node.js runtime (local dev): sentry.server.config.ts
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

export async function register() {
  // Edge runtime (Cloudflare Workers)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }

  // Node.js runtime (local development)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
}

/**
 * Sensitive headers that should not be sent to Sentry to prevent PII leakage
 * These headers often contain authentication tokens, session IDs, or other secrets
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'proxy-authorization',
  'www-authenticate',
  'x-forwarded-authorization',
  'x-amzn-oidc-accesstoken',
  'x-amzn-oidc-identity',
]

/**
 * Sanitize request headers by removing sensitive information
 * @param headers - Original request headers
 * @returns Sanitized headers safe to send to Sentry
 */
function sanitizeHeaders(headers?: { [key: string]: string | string[] | undefined }): {
  [key: string]: string | string[]
} {
  if (!headers) {
    return {}
  }

  const sanitized: { [key: string]: string | string[] } = {}

  for (const [key, value] of Object.entries(headers)) {
    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Filter out sensitive headers (case-insensitive)
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    // Include non-sensitive headers
    sanitized[key] = value
  }

  return sanitized
}

/**
 * Server-side error handler
 * Automatically captures errors from Server Components, middleware, and proxies
 * Requires Next.js 15+ and @sentry/nextjs 8.28.0+
 *
 * Security: Headers are sanitized to prevent PII leakage (Authorization, Cookie, etc.)
 *
 * @param error - The error object
 * @param request - The incoming request
 */
export async function onRequestError(
  error: Error & { digest?: string },
  request: {
    path: string
    method?: string
    headers?: { [key: string]: string | string[] | undefined }
  },
) {
  // Import Sentry dynamically to avoid bundling issues
  const Sentry = await import('@sentry/nextjs')

  // Sanitize headers to prevent PII leakage
  const sanitizedHeaders = sanitizeHeaders(request.headers)

  Sentry.captureException(error, {
    tags: {
      runtime: process.env.NEXT_RUNTIME || 'unknown',
      path: request.path,
      method: request.method || 'unknown',
    },
    extra: {
      digest: error.digest,
      headers: sanitizedHeaders,
    },
  })
}
