import { BaseError } from './base'

/**
 * Error class for configuration-related failures
 * Includes configuration key information
 */
export class ConfigurationError extends BaseError {
  constructor(
    message: string,
    public readonly key: string,
    context?: Record<string, unknown>,
  ) {
    super(message, 'CONFIGURATION_ERROR', {
      key,
      ...context,
    })
  }
}
