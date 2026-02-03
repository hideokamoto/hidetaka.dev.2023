/**
 * Base error class for all custom errors
 * Provides structured error handling with context and metadata
 */
export abstract class BaseError extends Error {
  public readonly timestamp: Date
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    public readonly code: string,
    context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = new Date()
    this.context = context

    // Improve stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Serialize error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    }
  }
}
