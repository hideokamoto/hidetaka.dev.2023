import {
  captureException,
  captureMessage,
  isInitialized,
} from '@sentry/cloudflare'

let missingApiKeyReported = false

/**
 * Check if Sentry is properly configured
 * Sentry is initialized via SENTRY_DSN environment variable in Cloudflare Workers
 */
function isSentryConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN) && isInitialized()
}

/**
 * Report missing MicroCMS API key to Sentry
 * This is called once per process to avoid spam
 */
export function reportMissingMicroCMSApiKey() {
  if (missingApiKeyReported) {
    return
  }

  missingApiKeyReported = true

  console.error(
    '[MicroCMS] MICROCMS_API_KEY is missing or not configured. MicroCMS data will not be available.',
  )

  if (!isSentryConfigured()) {
    console.warn('[Sentry] SENTRY_DSN is not set. Error not reported to Sentry.')
    return
  }

  captureMessage('MICROCMS_API_KEY is missing or not configured', {
    level: 'error',
    tags: {
      service: 'microcms',
      issue_type: 'missing_api_key',
    },
    fingerprint: ['microcms', 'missing-api-key'],
  })
}

/**
 * Report MicroCMS API error to Sentry
 * @param error - The error that occurred
 * @param context - Additional context about the API call
 */
export function reportMicroCMSApiError(
  error: unknown,
  context: {
    endpoint: string
    method: string
    contentId?: string
  },
) {
  console.error(`[MicroCMS] API error in ${context.method}:`, {
    endpoint: context.endpoint,
    error: error instanceof Error ? error.message : String(error),
  })

  if (!isSentryConfigured()) {
    return
  }

  const errorObj = error instanceof Error ? error : new Error(String(error))

  captureException(errorObj, {
    tags: {
      service: 'microcms',
      endpoint: context.endpoint,
      method: context.method,
    },
    extra: {
      contentId: context.contentId,
    },
    fingerprint: ['microcms', 'api-error', context.endpoint, context.method],
  })
}
