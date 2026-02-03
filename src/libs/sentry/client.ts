/**
 * Browser-side Sentry configuration
 * Uses @sentry/browser for client-side error tracking
 */

import * as Sentry from '@sentry/browser'

/**
 * Common non-actionable errors that should be ignored
 * These are typically browser extensions, network issues, or third-party scripts
 */
const IGNORED_ERRORS = [
  // Browser extension errors
  'top.GLOBALS',
  'canvas.contentDocument',
  'MyApp_RemoveAllHighlights',
  'atomicFindClose',
  // Network errors that are user-side issues
  'ChunkLoadError',
  'Loading chunk',
  'Failed to fetch',
  // Third-party script errors
  'fb_xd_fragment',
  'bmi_SafeAddOnload',
  'EBCallBackMessageReceived',
  // Mobile-specific errors
  'Non-Error promise rejection captured',
]

/**
 * Initialize Sentry for browser context
 * Should only be called in browser environment
 *
 * Note: Sentry is only initialized in production mode.
 * In development, errors are logged to console only.
 */
export function initSentry(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  // Skip initialization if DSN is not configured
  if (!dsn) {
    console.warn('[Sentry] Browser DSN not configured, skipping initialization')
    return
  }

  // Skip initialization in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Sentry] Development mode detected, skipping Sentry initialization')
    console.log('[Sentry] Errors will be logged to console only')
    return
  }

  // Skip initialization if already initialized
  if (Sentry.isInitialized()) {
    console.warn('[Sentry] Browser SDK already initialized')
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Disable tracing to reduce overhead
    // Only capture errors, not performance data
    tracesSampleRate: 0,

    // Ignore common non-actionable errors
    ignoreErrors: IGNORED_ERRORS,

    // Configure beforeSend to add additional context
    beforeSend(event, _hint) {
      // Add custom tags
      if (event.tags) {
        event.tags.runtime = 'browser'
      } else {
        event.tags = { runtime: 'browser' }
      }

      return event
    },
  })

  console.log('[Sentry] Browser SDK initialized')
}

/**
 * Capture an exception in Sentry
 * @param error - The error to capture
 * @param context - Additional context data
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!Sentry.isInitialized()) {
    console.warn('[Sentry] Browser SDK not initialized, skipping error capture')
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture a message in Sentry
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context data
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  if (!Sentry.isInitialized()) {
    console.warn('[Sentry] Browser SDK not initialized, skipping message capture')
    return
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  })
}
