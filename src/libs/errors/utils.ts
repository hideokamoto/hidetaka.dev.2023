import { logger } from '@/libs/logger'
import { APIError } from './api-error'
import { BaseError } from './base'
import { ConfigurationError } from './configuration-error'
import { NotFoundError } from './not-found-error'
import { ValidationError } from './validation-error'

/**
 * Type guard to check if error is a BaseError instance
 */
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError
}

/**
 * Safely log error with structured context
 * Integrates with existing logger and Sentry
 */
export function logError(error: unknown, additionalContext?: Record<string, unknown>) {
  if (isBaseError(error)) {
    logger.error(error.message, {
      ...error.toJSON(),
      ...additionalContext,
    })
  } else if (error instanceof Error) {
    logger.error(error.message, {
      name: error.name,
      stack: error.stack,
      ...additionalContext,
    })
  } else {
    logger.error('Unknown error', {
      error: String(error),
      ...additionalContext,
    })
  }
}

/**
 * Get HTTP status code from error
 * Returns appropriate status code based on error type
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof APIError) {
    return error.statusCode
  }
  if (error instanceof NotFoundError) {
    return 404
  }
  if (error instanceof ValidationError) {
    return 400
  }
  if (error instanceof ConfigurationError) {
    return 500
  }
  return 500
}
