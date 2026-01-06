'use client'

import { useEffect } from 'react'
import { logger } from '@/libs/logger'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-zinc-50 dark:bg-black">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            エラーが発生しました
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          {error.digest && (
            <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
              エラーID: {error.digest}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}
