'use client'

import { useEffect } from 'react'
import ErrorUI from '@/components/ui/ErrorUI'
import { logger } from '@/libs/logger'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console and Sentry via logger
    logger.error(`Application error: ${error.message}`, {
      stack: error.stack,
      digest: error.digest,
    })

    // Also capture directly to Sentry with additional context
    import('@/libs/sentry/client')
      .then(({ captureException }) => {
        captureException(error, {
          digest: error.digest,
          location: 'ErrorBoundary',
          page: window.location.pathname,
        })
      })
      .catch((sentryError) => {
        console.error('[ErrorBoundary] Failed to capture error to Sentry:', sentryError)
      })
  }, [error])

  return (
    <ErrorUI
      title="Something went wrong"
      message="We encountered an unexpected error. Please try again."
      resetLabel="Try again"
      onReset={reset}
      errorDigest={error.digest}
      errorIdLabel="Error ID:"
    />
  )
}
