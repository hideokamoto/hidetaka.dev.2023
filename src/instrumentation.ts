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
 * Server-side error handler
 * Automatically captures errors from Server Components, middleware, and proxies
 * Requires Next.js 15+ and @sentry/nextjs 8.28.0+
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

  Sentry.captureException(error, {
    tags: {
      runtime: process.env.NEXT_RUNTIME || 'unknown',
      path: request.path,
      method: request.method || 'unknown',
    },
    extra: {
      digest: error.digest,
      headers: request.headers,
    },
  })
}
