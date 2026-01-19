/**
 * Sentry Test Client Component
 *
 * This is a client component that provides interactive testing UI for Sentry error tracking.
 * It's used by the test-sentry page (both English and Japanese versions).
 */

'use client'

import { useState } from 'react'

export default function SentryTestClient() {
  const [lastResult, setLastResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testBrowserError = () => {
    setLastResult('Triggering browser error...')
    throw new Error('Test browser error from Sentry verification page')
  }

  const testBrowserLogger = () => {
    setLastResult('Logging browser error via logger...')
    import('@/libs/logger')
      .then(({ logger }) => {
        logger.error('Test browser error via logger', {
          testType: 'browser-logger-error',
          page: '/test-sentry',
          timestamp: new Date().toISOString(),
        })
        setLastResult('Browser error logged successfully! Check console and Sentry.')
      })
      .catch((error) => {
        setLastResult(`Failed to log browser error: ${error.message}`)
      })
  }

  const testBrowserWarning = () => {
    setLastResult('Logging browser warning via logger...')
    import('@/libs/logger')
      .then(({ logger }) => {
        logger.warn('Test browser warning via logger', {
          testType: 'browser-logger-warning',
          page: '/test-sentry',
          timestamp: new Date().toISOString(),
        })
        setLastResult('Browser warning logged successfully! Check console and Sentry.')
      })
      .catch((error) => {
        setLastResult(`Failed to log browser warning: ${error.message}`)
      })
  }

  const testServerError = async () => {
    setIsLoading(true)
    setLastResult('Sending server error request...')

    try {
      const response = await fetch('/api/test-sentry?type=error')
      const data = await response.json()
      setLastResult(`Server response: ${data.message}`)
    } catch (error) {
      setLastResult(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testServerWarning = async () => {
    setIsLoading(true)
    setLastResult('Sending server warning request...')

    try {
      const response = await fetch('/api/test-sentry?type=warning')
      const data = await response.json()
      setLastResult(`Server response: ${data.message}`)
    } catch (error) {
      setLastResult(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testServerException = async () => {
    setIsLoading(true)
    setLastResult('Triggering server exception...')

    try {
      await fetch('/api/test-sentry?type=exception')
      setLastResult('Server exception triggered')
    } catch (error) {
      setLastResult(
        `Server exception captured: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Sentry Error Tracking Test
          </h1>

          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Development Mode Only:</strong> This page is for testing Sentry integration.
              Click the buttons below to trigger test errors and verify they appear in your Sentry
              dashboard.
            </p>
          </div>

          <div className="space-y-8">
            {/* Browser Error Tests */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                Browser Error Tests
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={testBrowserError}
                  className="px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Throw Browser Error
                </button>
                <button
                  type="button"
                  onClick={testBrowserLogger}
                  className="px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Log Browser Error
                </button>
                <button
                  type="button"
                  onClick={testBrowserWarning}
                  className="px-4 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Log Browser Warning
                </button>
              </div>
            </section>

            {/* Server Error Tests */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                Server Error Tests
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={testServerError}
                  disabled={isLoading}
                  className="px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Log Server Error'}
                </button>
                <button
                  type="button"
                  onClick={testServerWarning}
                  disabled={isLoading}
                  className="px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Log Server Warning'}
                </button>
                <button
                  type="button"
                  onClick={testServerException}
                  disabled={isLoading}
                  className="px-4 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Throw Server Exception'}
                </button>
              </div>
            </section>

            {/* Result Display */}
            {lastResult && (
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                  Last Result
                </h2>
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-slate-800 dark:text-slate-200 font-mono text-sm">
                    {lastResult}
                  </p>
                </div>
              </section>
            )}

            {/* Instructions */}
            <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                Verification Steps
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li>Configure NEXT_PUBLIC_SENTRY_DSN in your .env.local file</li>
                <li>Ensure you're running in development mode (npm run dev)</li>
                <li>Click any test button above</li>
                <li>
                  Check your browser console for error logs (all modes show console logs in
                  development)
                </li>
                <li>
                  In production mode, check your Sentry dashboard for captured errors (
                  <a
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    sentry.io
                  </a>
                  )
                </li>
                <li>Verify error context includes source: 'logger' tag and custom context data</li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
