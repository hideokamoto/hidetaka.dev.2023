import { BaseError } from './base'

/**
 * Error class for validation failures
 * Includes field name and invalid value information
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown,
    context?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', {
      field,
      value,
      ...context,
    })
  }
}
