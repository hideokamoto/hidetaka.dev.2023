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
          location: 'ErrorBoundary (Japanese)',
          page: window.location.pathname,
        })
      })
      .catch((sentryError) => {
        console.error('[ErrorBoundary] Failed to capture error to Sentry:', sentryError)
      })
  }, [error])

  return (
    <ErrorUI
      title="エラーが発生しました"
      message="申し訳ございません。予期しないエラーが発生しました。"
      resetLabel="もう一度試す"
      onReset={reset}
      errorDigest={error.digest}
      errorIdLabel="エラーID:"
    />
  )
}
