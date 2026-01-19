/**
 * Sentry Test Route (Development Only)
 *
 * This route is used to test Sentry error tracking.
 * It should only be accessible in development mode.
 *
 * Usage:
 * - GET /api/sentry-test?type=error - Triggers a test error
 * - GET /api/sentry-test?type=warning - Triggers a test warning
 * - GET /api/sentry-test?type=exception - Triggers an exception
 *
 * IMPORTANT: This route is disabled in production for security.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { logger } from '@/libs/logger'

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 },
    )
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'error'

  switch (type) {
    case 'error':
      // Test logger.error (server-side, development-only, not sent to Sentry)
      logger.error('Test error from Sentry test route', {
        testType: 'error',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      })
      return NextResponse.json({
        success: true,
        message: 'Test error logged via logger.error() on server-side',
        type: 'error',
        note: 'Development-only test. Server-side errors are not sent to Sentry. Check console for logs. This route returns 403 in production.',
      })

    case 'warning':
      // Test logger.warn (server-side, development-only, not sent to Sentry)
      logger.warn('Test warning from Sentry test route', {
        testType: 'warning',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      })
      return NextResponse.json({
        success: true,
        message: 'Test warning logged via logger.warn() on server-side',
        type: 'warning',
        note: 'Development-only test. Server-side warnings are not sent to Sentry. Check console for logs. This route returns 403 in production.',
      })

    case 'exception':
      // Throw an actual exception to test error boundary
      throw new Error('Test exception from Sentry test route')

    default:
      return NextResponse.json(
        {
          error: 'Invalid test type',
          validTypes: ['error', 'warning', 'exception'],
        },
        { status: 400 },
      )
  }
}
