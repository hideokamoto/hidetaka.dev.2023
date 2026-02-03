import { BaseError } from './base'

/**
 * Error class for resource not found
 * Includes resource type and identifier information
 */
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier: string, context?: Record<string, unknown>) {
    super(`${resource} not found: ${identifier}`, 'NOT_FOUND', {
      resource,
      identifier,
      ...context,
    })
  }
}
