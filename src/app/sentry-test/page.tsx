'use client'

/**
 * Sentry Test Page (Development Only)
 *
 * This page provides UI buttons to test Sentry error tracking.
 * It should only be accessible in development mode.
 *
 * Features:
 * - Test browser-side errors via logger
 * - Test browser-side exceptions
 * - Test server-side errors via API
 *
 * IMPORTANT: This page should be removed or protected in production.
 */

import { useState } from 'react'
import { logger } from '@/libs/logger'

export default function SentryTestPage() {
  const [status, setStatus] = useState<string>('')

  const handleBrowserError = async () => {
    setStatus('Triggering browser error via logger...')
    logger.error('Test browser error from test page', {
      testType: 'browser-error',
      timestamp: new Date().toISOString(),
      location: window.location.href,
    })
    setStatus('✅ Browser error logged! Check console and Sentry.')
  }

  const handleBrowserWarning = async () => {
    setStatus('Triggering browser warning via logger...')
    logger.warn('Test browser warning from test page', {
      testType: 'browser-warning',
      timestamp: new Date().toISOString(),
      location: window.location.href,
    })
    setStatus('✅ Browser warning logged! Check console and Sentry.')
  }

  const handleBrowserException = () => {
    setStatus('Triggering browser exception...')
    throw new Error('Test browser exception from test page')
  }

  const handleServerError = async () => {
    setStatus('Triggering server error via API...')
    try {
      const response = await fetch('/api/sentry-test?type=error')
      const data = await response.json()
      setStatus(`✅ Server error triggered: ${data.message}`)
    } catch (error) {
      setStatus(`❌ Failed to trigger server error: ${error}`)
    }
  }

  const handleServerWarning = async () => {
    setStatus('Triggering server warning via API...')
    try {
      const response = await fetch('/api/sentry-test?type=warning')
      const data = await response.json()
      setStatus(`✅ Server warning triggered: ${data.message}`)
    } catch (error) {
      setStatus(`❌ Failed to trigger server warning: ${error}`)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Available
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            This page is only available in development mode.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Sentry Error Tracking Test
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
            Test various types of errors to verify Sentry integration.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Development Only - This page is disabled in production
          </p>
        </div>

        {status && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p className="text-sm text-indigo-900 dark:text-indigo-100">{status}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Browser-side tests */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Browser-side Tests
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              These tests run in the browser and should be captured by @sentry/browser
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBrowserError}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Trigger Browser Error (via logger.error)
              </button>
              <button
                type="button"
                onClick={handleBrowserWarning}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
              >
                Trigger Browser Warning (via logger.warn)
              </button>
              <button
                type="button"
                onClick={handleBrowserException}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Trigger Browser Exception (throws Error)
              </button>
            </div>
          </div>

          {/* Server-side tests */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Server-side Tests
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              These tests run on the server and should be captured by @sentry/cloudflare
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleServerError}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Trigger Server Error (via API)
              </button>
              <button
                type="button"
                onClick={handleServerWarning}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
              >
                Trigger Server Warning (via API)
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
              Verification Steps
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <li>Set up your Sentry project and get DSN</li>
              <li>
                Add{' '}
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                  NEXT_PUBLIC_SENTRY_DSN
                </code>{' '}
                to .env.local
              </li>
              <li>
                Add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">SENTRY_DSN</code> to
                .env.local
              </li>
              <li>Restart the dev server</li>
              <li>Click the test buttons above</li>
              <li>Check browser console for local logs</li>
              <li>Check Sentry dashboard for captured errors (in production only)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
