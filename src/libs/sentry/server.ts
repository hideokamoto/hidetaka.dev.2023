/**
 * Server-side Sentry configuration for Cloudflare Workers
 * Uses @sentry/cloudflare for Workers V8 runtime compatibility
 *
 * For Next.js on Cloudflare Workers (via OpenNext), Sentry works automatically
 * with the correct Wrangler configuration (no manual initialization needed):
 *
 * Requirements (configured in wrangler.jsonc):
 * - compatibility_flags: ["nodejs_compat"] - Enables Node.js APIs required by Sentry
 * - compatibility_date: "2025-08-16" or later - Provides https.request for Sentry data transmission
 *
 * See: https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/deploying-on-cloudflare/
 */

import {
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
} from '@sentry/cloudflare'

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

/**
 * Check if Sentry DSN is configured
 */
function isSentryConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN)
}

/**
 * Initialize Sentry for Cloudflare Workers context
 *
 * For Next.js on Cloudflare Workers (via OpenNext), manual initialization is not required.
 * Sentry works automatically with the correct Wrangler configuration.
 * This function is maintained for API compatibility but performs no action.
 *
 * Requires wrangler.jsonc configuration:
 * - compatibility_flags: ["nodejs_compat"]
 * - compatibility_date: "2025-08-16" or later
 */
export function initSentry(): void {
  // No initialization needed - Sentry works automatically with correct Wrangler config
  // See: https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/deploying-on-cloudflare/

  if (process.env.NODE_ENV === 'development' && isSentryConfigured()) {
    console.log('[Sentry] Server-side Sentry is configured (via Wrangler compatibility settings)')
    console.log('[Sentry] Ensure wrangler.jsonc has:')
    console.log('[Sentry]   - compatibility_date: "2025-08-16" or later')
    console.log('[Sentry]   - compatibility_flags: ["nodejs_compat"]')
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
 * Check if Sentry is initialized
 * @returns true if Sentry is configured (DSN is set)
 *
 * For Next.js on Cloudflare Workers, Sentry works automatically with
 * correct Wrangler configuration, so we check if DSN is configured.
 */
export function isSentryInitialized(): boolean {
  return isSentryConfigured()
}
