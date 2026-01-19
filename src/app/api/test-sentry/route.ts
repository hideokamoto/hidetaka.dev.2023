/**
 * Development-only test route for Sentry error tracking verification
 *
 * This route is only available in development mode and provides
 * endpoints to trigger test errors for verifying Sentry integration.
 *
 * Usage:
 * - GET /api/test-sentry?type=error - Trigger a server error
 * - GET /api/test-sentry?type=warning - Trigger a server warning
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

  const searchParams = request.nextUrl.searchParams
  const testType = searchParams.get('type') || 'error'

  switch (testType) {
    case 'error':
      // Trigger a test error
      logger.error('Test error from Sentry verification route', {
        testType: 'server-error',
        route: '/api/test-sentry',
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        message: 'Test error logged. Check console and Sentry dashboard.',
        type: 'error',
      })

    case 'warning':
      // Trigger a test warning
      logger.warn('Test warning from Sentry verification route', {
        testType: 'server-warning',
        route: '/api/test-sentry',
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        message: 'Test warning logged. Check console and Sentry dashboard.',
        type: 'warning',
      })

    case 'exception':
      // Trigger an unhandled exception
      throw new Error('Test exception for Sentry verification')

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
