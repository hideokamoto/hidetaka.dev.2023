/**
 * Development-only Sentry testing page
 *
 * This page provides a UI for testing Sentry error tracking.
 * Only accessible in development mode.
 */

import SentryTestClient from '@/components/sentry/SentryTestClient'

export default async function TestSentryPage() {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Not Available in Production
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            This test page is only available in development mode.
          </p>
        </div>
      </div>
    )
  }

  return <SentryTestClient />
}
