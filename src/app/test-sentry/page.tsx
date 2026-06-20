/**
 * Development-only Sentry testing page
 *
 * This page provides a UI for testing Sentry error tracking.
 * Only accessible in development mode.
 */

import type { Metadata } from 'next'
import SentryTestClient from '@/components/sentry/SentryTestClient'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function TestSentryPage() {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
            Not Available in Production
          </h1>
          <p style={{ color: 'var(--rvt-fg2)' }}>
            This test page is only available in development mode.
          </p>
        </div>
      </div>
    )
  }

  return <SentryTestClient />
}
