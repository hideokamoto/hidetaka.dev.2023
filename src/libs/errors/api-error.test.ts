import { describe, expect, it } from 'vitest'
import { APIError } from './api-error'

describe('APIError', () => {
  it('should hold error information correctly', () => {
    const error = new APIError('Request failed', 500, '/api/test', {
      requestId: '123',
    })

    expect(error.message).toBe('Request failed')
    expect(error.statusCode).toBe(500)
    expect(error.endpoint).toBe('/api/test')
    expect(error.code).toBe('API_ERROR')
    expect(error.context?.requestId).toBe('123')
    expect(error.context?.statusCode).toBe(500)
    expect(error.context?.endpoint).toBe('/api/test')
  })

  it('should identify retryable errors (5xx)', () => {
    const error500 = new APIError('Server error', 500, '/api/test')
    const error502 = new APIError('Bad gateway', 502, '/api/test')
    const error503 = new APIError('Service unavailable', 503, '/api/test')

    expect(error500.isRetryable()).toBe(true)
    expect(error502.isRetryable()).toBe(true)
    expect(error503.isRetryable()).toBe(true)
  })

  it('should identify retryable errors (429)', () => {
    const error = new APIError('Too many requests', 429, '/api/test')
    expect(error.isRetryable()).toBe(true)
  })

  it('should identify non-retryable errors', () => {
    const error404 = new APIError('Not found', 404, '/api/test')
    const error400 = new APIError('Bad request', 400, '/api/test')
    const error401 = new APIError('Unauthorized', 401, '/api/test')

    expect(error404.isRetryable()).toBe(false)
    expect(error400.isRetryable()).toBe(false)
    expect(error401.isRetryable()).toBe(false)
  })

  it('should serialize to JSON correctly', () => {
    const error = new APIError('Test error', 500, '/api/test', {
      customField: 'value',
    })
    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'APIError')
    expect(json).toHaveProperty('code', 'API_ERROR')
    expect(json).toHaveProperty('message', 'Test error')
    expect(json).toHaveProperty('timestamp')
    expect(json.context).toHaveProperty('statusCode', 500)
    expect(json.context).toHaveProperty('endpoint', '/api/test')
    expect(json.context).toHaveProperty('customField', 'value')
    expect(json).toHaveProperty('stack')
  })

  it('should create error from JSON response', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'content-type': 'application/json',
      },
    })

    const error = await APIError.fromResponse(mockResponse, '/api/test', {
      userId: '123',
    })

    expect(error.message).toBe('API request failed: Internal Server Error')
    expect(error.statusCode).toBe(500)
    expect(error.endpoint).toBe('/api/test')
    expect(error.context?.userId).toBe('123')
    expect(error.context?.responseBody).toEqual({
      error: 'Internal server error',
    })
  })

  it('should create error from text response', async () => {
    const mockResponse = new Response('Error text', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'content-type': 'text/plain',
      },
    })

    const error = await APIError.fromResponse(mockResponse, '/api/test')

    expect(error.message).toBe('API request failed: Internal Server Error')
    expect(error.context?.responseBody).toBe('Error text')
  })

  it('should handle response body parse failure', async () => {
    // Create a response with content-type: application/json but invalid JSON
    const mockResponse = new Response('invalid json', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'content-type': 'application/json',
      },
    })

    // Mock the json() method to throw
    const originalJson = mockResponse.json
    mockResponse.json = () => Promise.reject(new Error('Invalid JSON'))

    const error = await APIError.fromResponse(mockResponse, '/api/test')

    expect(error.message).toBe('API request failed: Internal Server Error')
    expect(error.context?.responseBody).toBeNull()

    // Restore original method
    mockResponse.json = originalJson
  })

  it('should have proper error name', () => {
    const error = new APIError('Test', 500, '/api/test')
    expect(error.name).toBe('APIError')
  })

  it('should have timestamp', () => {
    const before = new Date()
    const error = new APIError('Test', 500, '/api/test')
    const after = new Date()

    expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})
