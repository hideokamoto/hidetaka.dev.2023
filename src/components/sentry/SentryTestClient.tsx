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
    <div className="min-h-dvh py-12 px-4" style={{ background: 'var(--rvt-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg shadow-lg p-8" style={{ background: 'var(--rvt-bg2)' }}>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
            Sentry Error Tracking Test
          </h1>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode Only:</strong> This page is for testing Sentry integration.
              Click the buttons below to trigger test errors and verify they appear in your Sentry
              dashboard.
            </p>
          </div>

          <div className="space-y-8">
            {/* Browser Error Tests */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
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
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                Server Error Tests
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={testServerError}
                  disabled={isLoading}
                  className="px-4 py-3 bg-yamabuki-600 text-white font-semibold rounded-lg hover:bg-yamabuki-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                  Last Result
                </h2>
                <div className="p-4 rounded-lg" style={{ background: 'var(--rvt-bg3)' }}>
                  <p className="font-mono text-sm" style={{ color: 'var(--rvt-fg)' }}>
                    {lastResult}
                  </p>
                </div>
              </section>
            )}

            {/* Instructions */}
            <section className="border-t pt-6" style={{ borderColor: 'var(--rvt-border)' }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                Verification Steps
              </h2>
              <ol
                className="list-decimal list-inside space-y-2"
                style={{ color: 'var(--rvt-fg2)' }}
              >
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
                    className="text-indigo-600 hover:underline"
                    style={{ color: 'var(--rvt-accent)' }}
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
