/**
 * Sentry Edge Runtime Configuration
 * Used for Cloudflare Workers deployment via OpenNext
 *
 * This file is automatically loaded by instrumentation.ts when NEXT_RUNTIME=edge
 * Supports automatic error flushing via waitUntil detection (requires @sentry/nextjs v10.28.0+)
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/deploying-on-cloudflare/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Data Source Name - public key for sending events to Sentry
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Release tracking for correlating errors with deployments
  release: process.env.SENTRY_RELEASE,

  // Environment name
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring - disabled to reduce overhead
  // Only error tracking is enabled
  tracesSampleRate: 0,

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Automatically capture console errors
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],

  // Event filtering - ignore common non-actionable errors
  beforeSend(event) {
    // In development, log to console but don't send to Sentry
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Edge] Would send event:', event)
      return null
    }

    return event
  },
})
