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
      // Test logger.error which should send to Sentry in production
      logger.error('Test error from Sentry test route', {
        testType: 'error',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      })
      return NextResponse.json({
        success: true,
        message: 'Test error logged via logger.error()',
        type: 'error',
        note: 'Check console and Sentry (in production) for the error',
      })

    case 'warning':
      // Test logger.warn which should send to Sentry in production
      logger.warn('Test warning from Sentry test route', {
        testType: 'warning',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      })
      return NextResponse.json({
        success: true,
        message: 'Test warning logged via logger.warn()',
        type: 'warning',
        note: 'Check console and Sentry (in production) for the warning',
      })

    case 'exception':
      // Throw an actual exception to test error boundary
      throw new Error('Test exception from Sentry test route')

    default:
      return NextResponse.json({
        error: 'Invalid test type',
        validTypes: ['error', 'warning', 'exception'],
      })
  }
}
