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
    logger.error(`Application error: ${error.message}`, {
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <ErrorUI
      title="Something went wrong"
      message="We encountered an unexpected error. Please try again."
      resetLabel="Try again"
      onReset={reset}
      errorDigest={error.digest}
    />
  )
}
