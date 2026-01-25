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
  isInitialized,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
} from '@sentry/cloudflare'
import { env } from '@/env'

// Note: We use process.env.NODE_ENV directly instead of env.NODE_ENV
// because tests need to mock NODE_ENV dynamically, and the env module
// is evaluated at import time.

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

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
 * @returns true if Sentry SDK is initialized
 *
 * Note: For Cloudflare Workers with automatic Wrangler configuration,
 * this will return false unless Sentry.init() is explicitly called.
 * Use isSentryConfigured() to check if DSN is configured instead.
 */
export function isSentryInitialized(): boolean {
  return isInitialized()
}

/**
 * Check if Sentry DSN is configured
 * @returns true if SENTRY_DSN environment variable is set
 *
 * This indicates whether Sentry error capture will work in production.
 */
export function isSentryConfigured(): boolean {
  return Boolean(env.SENTRY_DSN)
}
