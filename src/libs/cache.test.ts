import { describe, expect, it } from 'vitest'
import {
  getCacheHeaders,
  getImmutableCacheHeaders,
  getLongCacheHeaders,
  getMediumCacheHeaders,
  getNoCacheHeaders,
  getShortCacheHeaders,
  getStaleWhileRevalidateHeaders,
} from './cache'

describe('cache utilities', () => {
  describe('getImmutableCacheHeaders', () => {
    it('should return immutable cache headers with default max-age', () => {
      const headers = getImmutableCacheHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=31536000, immutable')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=31536000')
      expect(headers['Cloudflare-CDN-Cache-Control']).toBe('public, max-age=31536000')
    })

    it('should return immutable cache headers with custom max-age', () => {
      const headers = getImmutableCacheHeaders(86400)

      expect(headers['Cache-Control']).toBe('public, max-age=86400, immutable')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=86400')
      expect(headers['Cloudflare-CDN-Cache-Control']).toBe('public, max-age=86400')
    })
  })

  describe('getShortCacheHeaders', () => {
    it('should return short cache headers with default max-age (5 minutes)', () => {
      const headers = getShortCacheHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=300')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=300')
    })

    it('should return short cache headers with custom max-age', () => {
      const headers = getShortCacheHeaders(60)

      expect(headers['Cache-Control']).toBe('public, max-age=60')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=60')
    })
  })

  describe('getMediumCacheHeaders', () => {
    it('should return medium cache headers with default max-age (1 hour)', () => {
      const headers = getMediumCacheHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=3600')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=3600')
    })

    it('should return medium cache headers with custom max-age', () => {
      const headers = getMediumCacheHeaders(7200)

      expect(headers['Cache-Control']).toBe('public, max-age=7200')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=7200')
    })
  })

  describe('getLongCacheHeaders', () => {
    it('should return long cache headers with default max-age (1 day)', () => {
      const headers = getLongCacheHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=86400')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=86400')
    })

    it('should return long cache headers with custom max-age', () => {
      const headers = getLongCacheHeaders(604800)

      expect(headers['Cache-Control']).toBe('public, max-age=604800')
      expect(headers['CDN-Cache-Control']).toBe('public, max-age=604800')
    })
  })

  describe('getStaleWhileRevalidateHeaders', () => {
    it('should return stale-while-revalidate headers with default values', () => {
      const headers = getStaleWhileRevalidateHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=3600, stale-while-revalidate=86400')
    })

    it('should return stale-while-revalidate headers with custom values', () => {
      const headers = getStaleWhileRevalidateHeaders(1800, 43200)

      expect(headers['Cache-Control']).toBe('public, max-age=1800, stale-while-revalidate=43200')
    })
  })

  describe('getCacheHeaders', () => {
    it('should return immutable headers for "immutable" strategy', () => {
      const headers = getCacheHeaders('immutable')

      expect(headers['Cache-Control']).toContain('immutable')
    })

    it('should return short cache headers for "short" strategy', () => {
      const headers = getCacheHeaders('short')

      expect(headers['Cache-Control']).toBe('public, max-age=300')
    })

    it('should return medium cache headers for "medium" strategy', () => {
      const headers = getCacheHeaders('medium')

      expect(headers['Cache-Control']).toBe('public, max-age=3600')
    })

    it('should return long cache headers for "long" strategy', () => {
      const headers = getCacheHeaders('long')

      expect(headers['Cache-Control']).toBe('public, max-age=86400')
    })

    it('should return stale-while-revalidate headers for "stale-while-revalidate" strategy', () => {
      const headers = getCacheHeaders('stale-while-revalidate')

      expect(headers['Cache-Control']).toContain('stale-while-revalidate')
    })

    it('should return medium cache headers as default', () => {
      const headers = getCacheHeaders()

      expect(headers['Cache-Control']).toBe('public, max-age=3600')
    })
  })

  describe('getNoCacheHeaders', () => {
    it('should return no-cache headers', () => {
      const headers = getNoCacheHeaders()

      expect(headers['Cache-Control']).toBe('no-store, no-cache, must-revalidate')
      expect(headers.Pragma).toBe('no-cache')
      expect(headers.Expires).toBe('0')
    })
  })
})
