/**
 * Server-side Sentry integration for Next.js on Cloudflare Workers
 * Uses @sentry/nextjs SDK with automatic initialization via instrumentation.ts
 *
 * Key Features:
 * - Automatic initialization via src/instrumentation.ts (Next.js 15+)
 * - Automatic error flushing via waitUntil detection (@sentry/nextjs v10.28.0+)
 * - Works with Cloudflare Workers deployment via OpenNext
 *
 * Requirements (configured in wrangler.jsonc):
 * - compatibility_flags: ["nodejs_compat"] - Enables Node.js APIs required by Sentry
 * - compatibility_date: "2025-08-16" or later - Provides https.request for Sentry data transmission
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/deploying-on-cloudflare/
 * @see https://github.com/getsentry/sentry-javascript/pull/18336 (waitUntil detection)
 */

import {
  isEnabled,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
} from '@sentry/nextjs'

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

/**
 * Initialize Sentry (No-op function for backward compatibility)
 *
 * Sentry is automatically initialized via src/instrumentation.ts when Next.js starts.
 * This function is maintained for backward compatibility but performs no action.
 *
 * @see src/instrumentation.ts
 * @see src/sentry.edge.config.ts (for Cloudflare Workers)
 * @see src/sentry.server.config.ts (for local development)
 */
export function initSentry(): void {
  // Automatic initialization via instrumentation.ts
  // No manual initialization needed
  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Initialized automatically via instrumentation.ts')
  }
}

/**
 * Capture an exception in Sentry
 * @param error - The error to capture
 * @param context - Additional context data
 *
 * Sends the error to Sentry via @sentry/cloudflare.
 * Errors are always logged to console for visibility in Workers logs.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Always log to console for Cloudflare Workers logs
  console.error('[Sentry] Server error:', error, context)

  // In production with DSN configured, send to Sentry
  if (process.env.NODE_ENV === 'production' && isSentryConfigured()) {
    try {
      sentryCaptureException(error, {
        extra: context,
        tags: {
          runtime: 'cloudflare-workers',
          source: 'server',
        },
      })
    } catch (sentryError) {
      console.warn('[Sentry] Failed to capture exception:', sentryError)
    }
  }
}

/**
 * Capture a message in Sentry
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context data
 *
 * Sends the message to Sentry via @sentry/cloudflare.
 * Messages are always logged to console for visibility in Workers logs.
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  // Always log to console for Cloudflare Workers logs
  const logMethod = level === 'error' || level === 'fatal' ? console.error : console.log
  logMethod(`[Sentry] Server message [${level}]:`, message, context)

  // In production with DSN configured, send to Sentry
  if (process.env.NODE_ENV === 'production' && isSentryConfigured()) {
    try {
      sentryCaptureMessage(message, {
        level,
        extra: context,
        tags: {
          runtime: 'cloudflare-workers',
          source: 'server',
        },
      })
    } catch (sentryError) {
      console.warn('[Sentry] Failed to capture message:', sentryError)
    }
  }
}

/**
 * Check if Sentry is initialized and enabled
 * @returns true if Sentry SDK is initialized and enabled
 *
 * With @sentry/nextjs, Sentry is automatically initialized via instrumentation.ts.
 * This function checks if the SDK is actively enabled.
 */
export function isSentryInitialized(): boolean {
  return isEnabled()
}

/**
 * Check if Sentry DSN is configured
 * @returns true if SENTRY_DSN environment variable is set
 *
 * This indicates whether Sentry error capture will work in production.
 */
export function isSentryConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN)
}
