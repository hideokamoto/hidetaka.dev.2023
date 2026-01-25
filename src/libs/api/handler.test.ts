import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanupRateLimitStore } from '@/libs/ratelimit'
import { createErrorResponse, createSuccessResponse, withRateLimit } from './handler'

describe('API handler utilities', () => {
  beforeEach(() => {
    cleanupRateLimitStore()
  })

  afterEach(() => {
    cleanupRateLimitStore()
    vi.restoreAllMocks()
  })

  describe('withRateLimit', () => {
    it('should execute handler when under rate limit', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const handler = vi.fn(async () => new Response('OK', { status: 200 }))

      const response = await withRateLimit(request, handler)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('OK')

      // Should have rate limit headers
      expect(response.headers.has('X-RateLimit-Limit')).toBe(true)
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true)
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true)
    })

    it('should return 429 when over rate limit', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const handler = vi.fn(async () => new Response('OK', { status: 200 }))

      // Make requests up to limit
      await withRateLimit(request, handler, { rateLimit: { limit: 2, window: 60 } })
      await withRateLimit(request, handler, { rateLimit: { limit: 2, window: 60 } })

      // This should be over the limit
      const response = await withRateLimit(request, handler, {
        rateLimit: { limit: 2, window: 60 },
      })

      expect(response.status).toBe(429)
      expect(await response.text()).toBe('Too Many Requests')
      expect(response.headers.has('Retry-After')).toBe(true)
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')

      // Handler should not be called for rate-limited request
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should skip rate limiting when skipRateLimit is true', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const handler = vi.fn(async () => new Response('OK', { status: 200 }))

      // Make requests beyond normal limit
      for (let i = 0; i < 5; i++) {
        const response = await withRateLimit(request, handler, { skipRateLimit: true })
        expect(response.status).toBe(200)
      }

      expect(handler).toHaveBeenCalledTimes(5)
    })

    it('should handle handler errors gracefully', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const handler = vi.fn(async () => {
        throw new Error('Handler error')
      })

      const response = await withRateLimit(request, handler)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should use custom rate limit options', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const handler = vi.fn(async () => new Response('OK', { status: 200 }))

      // Custom limit of 3
      await withRateLimit(request, handler, { rateLimit: { limit: 3, window: 60 } })
      await withRateLimit(request, handler, { rateLimit: { limit: 3, window: 60 } })
      await withRateLimit(request, handler, { rateLimit: { limit: 3, window: 60 } })

      const response = await withRateLimit(request, handler, {
        rateLimit: { limit: 3, window: 60 },
      })

      expect(response.status).toBe(429)
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response with message', async () => {
      const response = createErrorResponse(400, 'Bad Request')

      expect(response.status).toBe(400)
      expect(response.headers.get('Content-Type')).toBe('application/json')

      const body = await response.json()
      expect(body).toEqual({ error: 'Bad Request' })
    })

    it('should create error response with details', async () => {
      const response = createErrorResponse(400, 'Validation Error', {
        field: 'email',
        reason: 'Invalid format',
      })

      expect(response.status).toBe(400)
      expect(response.headers.get('Content-Type')).toBe('application/json')

      const body = await response.json()
      expect(body).toEqual({
        error: 'Validation Error',
        details: {
          field: 'email',
          reason: 'Invalid format',
        },
      })
    })

    it('should handle different status codes', async () => {
      const response404 = createErrorResponse(404, 'Not Found')
      expect(response404.status).toBe(404)

      const response500 = createErrorResponse(500, 'Internal Server Error')
      expect(response500.status).toBe(500)

      const response403 = createErrorResponse(403, 'Forbidden')
      expect(response403.status).toBe(403)
    })
  })

  describe('createSuccessResponse', () => {
    it('should create success response with default status 200', async () => {
      const data = { result: 'success', value: 42 }
      const response = createSuccessResponse(data)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')

      const body = await response.json()
      expect(body).toEqual(data)
    })

    it('should create success response with custom status', async () => {
      const data = { created: true }
      const response = createSuccessResponse(data, 201)

      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body).toEqual(data)
    })

    it('should create success response with additional headers', async () => {
      const data = { result: 'ok' }
      const response = createSuccessResponse(data, 200, {
        'X-Custom-Header': 'custom-value',
        'Cache-Control': 'no-cache',
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('X-Custom-Header')).toBe('custom-value')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')

      const body = await response.json()
      expect(body).toEqual(data)
    })

    it('should handle different data types', async () => {
      // String
      const stringResponse = createSuccessResponse('hello')
      expect(await stringResponse.json()).toBe('hello')

      // Number
      const numberResponse = createSuccessResponse(42)
      expect(await numberResponse.json()).toBe(42)

      // Array
      const arrayResponse = createSuccessResponse([1, 2, 3])
      expect(await arrayResponse.json()).toEqual([1, 2, 3])

      // Null
      const nullResponse = createSuccessResponse(null)
      expect(await nullResponse.json()).toBeNull()
    })
  })
})
