'use client'

import { useEffect } from 'react'

/**
 * Sentry Provider Component
 * Initializes Sentry on the client side for browser error tracking
 *
 * This component should be added to the root layout to ensure
 * Sentry is initialized as early as possible in the browser.
 */
export default function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in browser context
    if (typeof window === 'undefined') {
      return
    }

    // Dynamically import and initialize browser Sentry
    // This ensures we don't bundle server code into the client
    import('@/libs/sentry/client')
      .then(({ initSentry }) => {
        initSentry()
      })
      .catch((error) => {
        console.error('[SentryProvider] Failed to initialize Sentry:', error)
      })
  }, [])

  return <>{children}</>
}
