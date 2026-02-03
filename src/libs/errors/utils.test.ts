import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIError } from './api-error'
import { ConfigurationError } from './configuration-error'
import { NotFoundError } from './not-found-error'
import { getErrorStatusCode, isBaseError, logError } from './utils'
import { ValidationError } from './validation-error'

// Mock logger
vi.mock('@/libs/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('isBaseError', () => {
  it('should return true for BaseError instances', () => {
    const error = new APIError('Test', 500, '/api/test')
    expect(isBaseError(error)).toBe(true)
  })

  it('should return true for all custom error types', () => {
    const apiError = new APIError('Test', 404, '/api/test')
    const validationError = new ValidationError('Invalid', 'field', 'value')
    const notFoundError = new NotFoundError('Resource', 'id')
    const configError = new ConfigurationError('Missing', 'KEY')

    expect(isBaseError(apiError)).toBe(true)
    expect(isBaseError(validationError)).toBe(true)
    expect(isBaseError(notFoundError)).toBe(true)
    expect(isBaseError(configError)).toBe(true)
  })

  it('should return false for standard Error', () => {
    const error = new Error('Standard error')
    expect(isBaseError(error)).toBe(false)
  })

  it('should return false for non-error values', () => {
    expect(isBaseError('string')).toBe(false)
    expect(isBaseError(123)).toBe(false)
    expect(isBaseError(null)).toBe(false)
    expect(isBaseError(undefined)).toBe(false)
    expect(isBaseError({})).toBe(false)
  })
})

describe('logError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log BaseError with structured data', async () => {
    const { logger } = await import('@/libs/logger')
    const error = new APIError('Test error', 500, '/api/test', {
      requestId: '123',
    })

    logError(error)

    expect(logger.error).toHaveBeenCalledWith('Test error', error.toJSON())
  })

  it('should log BaseError with additional context', async () => {
    const { logger } = await import('@/libs/logger')
    const error = new ValidationError('Invalid', 'email', 'test')
    const additionalContext = { userId: '456' }

    logError(error, additionalContext)

    expect(logger.error).toHaveBeenCalledWith('Invalid', {
      ...error.toJSON(),
      ...additionalContext,
    })
  })

  it('should log standard Error', async () => {
    const { logger } = await import('@/libs/logger')
    const error = new Error('Standard error')

    logError(error)

    expect(logger.error).toHaveBeenCalledWith('Standard error', {
      name: 'Error',
      stack: error.stack,
    })
  })

  it('should log unknown error types', async () => {
    const { logger } = await import('@/libs/logger')

    logError('String error')

    expect(logger.error).toHaveBeenCalledWith('Unknown error', {
      error: 'String error',
    })
  })
})

describe('getErrorStatusCode', () => {
  it('should return status code from APIError', () => {
    const error404 = new APIError('Not found', 404, '/api/test')
    const error500 = new APIError('Server error', 500, '/api/test')

    expect(getErrorStatusCode(error404)).toBe(404)
    expect(getErrorStatusCode(error500)).toBe(500)
  })

  it('should return 404 for NotFoundError', () => {
    const error = new NotFoundError('User', '123')
    expect(getErrorStatusCode(error)).toBe(404)
  })

  it('should return 400 for ValidationError', () => {
    const error = new ValidationError('Invalid', 'field', 'value')
    expect(getErrorStatusCode(error)).toBe(400)
  })

  it('should return 500 for ConfigurationError', () => {
    const error = new ConfigurationError('Missing', 'KEY')
    expect(getErrorStatusCode(error)).toBe(500)
  })

  it('should return 500 for standard Error', () => {
    const error = new Error('Standard error')
    expect(getErrorStatusCode(error)).toBe(500)
  })

  it('should return 500 for unknown error types', () => {
    expect(getErrorStatusCode('string')).toBe(500)
    expect(getErrorStatusCode(123)).toBe(500)
    expect(getErrorStatusCode(null)).toBe(500)
  })
})
