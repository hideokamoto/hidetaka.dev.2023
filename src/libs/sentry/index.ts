/**
 * Unified Sentry abstraction
 * Automatically routes to the appropriate SDK based on runtime context
 */

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

/**
 * Detect the current runtime environment
 * @returns 'browser' | 'server'
 */
function detectRuntime(): 'browser' | 'server' {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return 'browser'
  }
  // Otherwise, we're in a server/Workers environment
  return 'server'
}

/**
 * Initialize Sentry based on the current runtime context
 * - Browser: Uses @sentry/browser
 * - Server/Workers: Uses @sentry/cloudflare
 */
export async function initSentry(): Promise<void> {
  const runtime = detectRuntime()

  if (runtime === 'browser') {
    // Dynamically import browser SDK to prevent server bundling
    const { initSentry: initBrowserSentry } = await import('./client')
    initBrowserSentry()
  } else {
    // Dynamically import server SDK to prevent browser bundling
    const { initSentry: initServerSentry } = await import('./server')
    initServerSentry()
  }
}

/**
 * Capture an exception in Sentry
 * Routes to the appropriate SDK based on runtime context
 *
 * @param error - The error to capture
 * @param context - Additional context data
 */
export async function captureException(
  error: Error,
  context?: Record<string, unknown>,
): Promise<void> {
  const runtime = detectRuntime()

  if (runtime === 'browser') {
    // Dynamically import browser SDK to prevent server bundling
    const { captureException: captureBrowserException } = await import('./client')
    captureBrowserException(error, context)
  } else {
    // Dynamically import server SDK to prevent browser bundling
    const { captureException: captureServerException } = await import('./server')
    captureServerException(error, context)
  }
}

/**
 * Capture a message in Sentry
 * Routes to the appropriate SDK based on runtime context
 *
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context data
 */
export async function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>,
): Promise<void> {
  const runtime = detectRuntime()

  if (runtime === 'browser') {
    // Dynamically import browser SDK to prevent server bundling
    const { captureMessage: captureBrowserMessage } = await import('./client')
    captureBrowserMessage(message, level, context)
  } else {
    // Dynamically import server SDK to prevent browser bundling
    const { captureMessage: captureServerMessage } = await import('./server')
    captureServerMessage(message, level, context)
  }
}
