import { BaseError } from './base'

/**
 * Error class for API-related failures
 * Includes HTTP status code and endpoint information
 */
export class APIError extends BaseError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    context?: Record<string, unknown>,
  ) {
    super(message, 'API_ERROR', {
      statusCode,
      endpoint,
      ...context,
    })
  }

  /**
   * Create APIError from HTTP Response
   */
  static async fromResponse(
    response: Response,
    endpoint: string,
    context?: Record<string, unknown>,
  ): Promise<APIError> {
    let errorBody: unknown = null
    const contentType = response.headers.get('content-type')

    try {
      // Check if response is JSON based on content-type
      if (contentType?.includes('application/json')) {
        errorBody = await response.json()
      } else {
        errorBody = await response.text()
      }
    } catch {
      // If parsing fails, set to null
      errorBody = null
    }

    return new APIError(`API request failed: ${response.statusText}`, response.status, endpoint, {
      ...context,
      responseBody: errorBody,
    })
  }

  /**
   * Check if error is retryable
   * 5xx errors and 429 (Too Many Requests) are retryable
   */
  isRetryable(): boolean {
    return this.statusCode >= 500 || this.statusCode === 429
  }
}
