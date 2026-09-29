/**
 * Sentry Server Runtime Configuration
 * Used for Node.js runtime (local development)
 *
 * This file is automatically loaded by instrumentation.ts when NEXT_RUNTIME=nodejs
 * Note: Cloudflare Workers use Edge runtime, so this config is only for local dev
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Data Source Name - public key for sending events to Sentry
  dsn: process.env.SENTRY_DSN,

  // Release tracking for correlating errors with deployments
  release: process.env.SENTRY_RELEASE,

  // Environment name.
  // Fixed to 'local': this config only loads when NEXT_RUNTIME=nodejs (see
  // instrumentation.ts), which never happens on the deployed Cloudflare
  // Worker (edge runtime only, via sentry.edge.config.ts) — only during
  // local `next dev`/`next build`/`next start`. Using NODE_ENV here mislabels
  // local production-mode builds/tests as environment=production in Sentry,
  // creating false-positive production incidents (observed 2026-09-23:
  // HIDETAKA-DEV-M, HIDETAKA-DEV-N, both from a local MacBook-Pro-3.local
  // session against http://localhost:3000, tagged environment=production).
  environment: 'local',

  // Performance Monitoring - disabled to reduce overhead
  tracesSampleRate: 0,

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Automatically capture console errors
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],

  // Event filtering - ignore in development
  beforeSend(event) {
    // In development, log to console but don't send to Sentry
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Server] Would send event:', event)
      return null
    }

    return event
  },
})
