import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, cleanupRateLimitStore } from './ratelimit'

describe('rate limit utilities', () => {
  beforeEach(() => {
    // Reset the in-memory store before each test
    cleanupRateLimitStore()
  })

  afterEach(() => {
    // Clean up after each test
    cleanupRateLimitStore()
    vi.restoreAllMocks()
  })

  describe('checkRateLimit', () => {
    it('should allow request within rate limit', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const result = await checkRateLimit(request, { limit: 10, window: 60 })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(9)
      expect(result.reset).toBeGreaterThan(Date.now())
    })

    it('should track multiple requests from same IP', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      // First request
      const result1 = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      // Second request
      const result2 = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)

      // Third request
      const result3 = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)

      // Fourth request (over limit)
      const result4 = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result4.success).toBe(false)
      expect(result4.remaining).toBe(0)
    })

    it('should track different IPs separately', async () => {
      const request1 = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })
      const request2 = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.2' },
      })

      const result1 = await checkRateLimit(request1, { limit: 2, window: 60 })
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(1)

      const result2 = await checkRateLimit(request2, { limit: 2, window: 60 })
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)
    })

    it('should use X-Forwarded-For as fallback', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1' },
      })

      const result = await checkRateLimit(request, { limit: 10, window: 60 })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(9)
    })

    it('should use X-Real-IP as fallback', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'x-real-ip': '172.16.0.1' },
      })

      const result = await checkRateLimit(request, { limit: 10, window: 60 })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
      expect(result.remaining).toBe(9)
    })

    it('should use default limit and window when not specified', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      const result = await checkRateLimit(request)

      expect(result.limit).toBe(30)
      expect(result.success).toBe(true)
    })

    it('should reset after window expires', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      // Use a very short window for testing
      const result1 = await checkRateLimit(request, { limit: 1, window: 0.1 })
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(0)

      // Second request should be over limit
      const result2 = await checkRateLimit(request, { limit: 1, window: 0.1 })
      expect(result2.success).toBe(false)

      // Wait for window to expire (100ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Third request should succeed after window reset
      const result3 = await checkRateLimit(request, { limit: 1, window: 0.1 })
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should handle unknown identifier gracefully', async () => {
      const request = new Request('https://example.com/api/test')

      const result = await checkRateLimit(request, { limit: 10, window: 60 })

      // Should still work with fallback identifier
      expect(result.success).toBe(true)
      expect(result.limit).toBe(10)
    })

    it('should prefer cf-connecting-ip over other headers', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: {
          'cf-connecting-ip': '192.168.1.1',
          'x-forwarded-for': '10.0.0.1',
          'x-real-ip': '172.16.0.1',
        },
      })

      // First request
      const result1 = await checkRateLimit(request, { limit: 2, window: 60 })
      expect(result1.remaining).toBe(1)

      // Create request with same cf-connecting-ip
      const request2 = new Request('https://example.com/api/test', {
        headers: {
          'cf-connecting-ip': '192.168.1.1',
          'x-forwarded-for': '99.99.99.99', // Different, but should be ignored
        },
      })

      const result2 = await checkRateLimit(request2, { limit: 2, window: 60 })
      // Should be counted as same IP
      expect(result2.remaining).toBe(0)
    })
  })

  describe('cleanupRateLimitStore', () => {
    it('should clear all rate limit data', async () => {
      const request = new Request('https://example.com/api/test', {
        headers: { 'cf-connecting-ip': '192.168.1.1' },
      })

      // Make some requests
      await checkRateLimit(request, { limit: 3, window: 60 })
      await checkRateLimit(request, { limit: 3, window: 60 })

      let result = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result.remaining).toBe(0)

      // Cleanup
      cleanupRateLimitStore()

      // After cleanup, counter should be reset
      result = await checkRateLimit(request, { limit: 3, window: 60 })
      expect(result.remaining).toBe(2)
    })
  })
})
