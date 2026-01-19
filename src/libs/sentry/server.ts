/**
 * Server-side Sentry configuration for Cloudflare Workers
 * Uses @sentry/cloudflare for Workers V8 runtime compatibility
 *
 * NOTE: Full Cloudflare Workers integration with @sentry/cloudflare requires
 * wrapping the Workers handler with Sentry middleware. For Next.js deployed
 * to Cloudflare Workers via OpenNext, this integration is complex and requires
 * custom OpenNext configuration.
 *
 * Current implementation: Browser-only error tracking via @sentry/browser.
 * Server-side errors are logged to console and will appear in Cloudflare Workers logs.
 *
 * Future improvement: Integrate @sentry/cloudflare with OpenNext worker handler.
 * See: https://docs.sentry.io/platforms/javascript/guides/cloudflare/
 */

import {
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
} from '@sentry/cloudflare'

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

/**
 * Track if Sentry has been initialized
 * Note: For Cloudflare Workers with Next.js/OpenNext, initialization happens
 * at the Workers handler level, not in application code.
 */
let isInitialized = false

/**
 * Initialize Sentry for Cloudflare Workers context
 *
 * NOTE: This is a placeholder for future integration with OpenNext.
 * Full Cloudflare Workers Sentry integration requires modifying the
 * OpenNext-generated worker.js file to wrap the handler with withSentry().
 *
 * For now, server-side errors are only logged to console and will appear
 * in Cloudflare Workers logs. Browser-side errors are tracked via @sentry/browser.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN

  // Skip initialization if DSN is not configured
  if (!dsn) {
    console.warn(
      '[Sentry] Server DSN not configured, skipping initialization (errors will be logged to console)',
    )
    return
  }

  // Skip initialization in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Sentry] Development mode detected, skipping Sentry initialization')
    console.log('[Sentry] Errors will be logged to console only')
    return
  }

  // For Cloudflare Workers with Next.js/OpenNext, Sentry initialization
  // should be done in the worker handler, not here.
  console.warn('[Sentry] Server-side Sentry for Cloudflare Workers requires OpenNext integration')
  console.log('[Sentry] Server errors will be logged to console and Cloudflare Workers logs')
}

/**
 * Capture an exception in Sentry
 * @param error - The error to capture
 * @param context - Additional context data
 *
 * NOTE: This uses @sentry/cloudflare's captureException, but without proper
 * initialization in the Workers handler, events may not be sent to Sentry.
 * Errors are always logged to console for visibility in Workers logs.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Always log to console for Cloudflare Workers logs
  console.error('[Sentry] Server error:', error, context)

  // In production with DSN configured, attempt to send to Sentry
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
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
 * NOTE: This uses @sentry/cloudflare's captureMessage, but without proper
 * initialization in the Workers handler, events may not be sent to Sentry.
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

  // In production with DSN configured, attempt to send to Sentry
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
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
 * @returns true if Sentry is initialized
 *
 * NOTE: For Cloudflare Workers with Next.js/OpenNext, this always returns false
 * because initialization happens at the Workers handler level, not in application code.
 */
export function isSentryInitialized(): boolean {
  return isInitialized
}
