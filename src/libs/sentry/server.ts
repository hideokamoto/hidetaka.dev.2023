/**
 * Server-side Sentry configuration for Cloudflare Workers
 * Uses @sentry/cloudflare for Workers V8 runtime compatibility
 *
 * NOTE: This is a placeholder implementation for Task 1 (browser-only tracking).
 * Task 2 will implement full Cloudflare Workers integration with @sentry/cloudflare.
 *
 * For now, server-side errors are only logged to console.
 * To enable server-side Sentry tracking, implement Task 2.
 */

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

/**
 * Initialize Sentry for Cloudflare Workers context
 * This should be called once when the worker starts
 *
 * @placeholder This is a placeholder for Task 2 implementation
 */
export function initSentry(): void {
  // Placeholder: Will be implemented in Task 2 with @sentry/cloudflare
  console.log('[Sentry] Server-side initialization not yet implemented (Task 2)')
}

/**
 * Capture an exception in Sentry
 * @param error - The error to capture
 * @param context - Additional context data
 *
 * @placeholder This is a placeholder for Task 2 implementation
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Placeholder: Will be implemented in Task 2 with @sentry/cloudflare
  console.error('[Sentry] Server error (not sent to Sentry):', error, context)
}

/**
 * Capture a message in Sentry
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context data
 *
 * @placeholder This is a placeholder for Task 2 implementation
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  // Placeholder: Will be implemented in Task 2 with @sentry/cloudflare
  console.log(`[Sentry] Server message [${level}] (not sent to Sentry):`, message, context)
}

/**
 * Check if Sentry is initialized
 * @returns true if Sentry is initialized
 *
 * @placeholder This is a placeholder for Task 2 implementation
 */
export function isSentryInitialized(): boolean {
  return false
}
