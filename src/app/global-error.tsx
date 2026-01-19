'use client'

import { useEffect } from 'react'
import { DarkModeScript } from '@/components/DarkModeScript'
import { logger } from '@/libs/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console and Sentry via logger
    logger.error(`Global error: ${error.message}`, {
      stack: error.stack,
      digest: error.digest,
      location: 'GlobalError',
      page: window.location.pathname,
    })
  }, [error])

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <DarkModeScript />
      </head>
      <body className="flex h-full flex-col bg-zinc-50 dark:bg-black">
        <div className="flex flex-grow items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Critical Error
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                A critical error occurred. Please reload the page.
              </p>
              {error.digest && (
                <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
