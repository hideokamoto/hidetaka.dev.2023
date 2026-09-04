import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { withCache, withCacheAndContext } from './cloudflareCache'

vi.mock('@/libs/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const { logger } = await import('@/libs/logger')

type MockCache = {
  match: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
}

function createMockCache(): MockCache {
  return {
    match: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
  }
}

function installCaches(mockCache: MockCache) {
  const cacheStorage = { default: mockCache } as CacheStorage & { default: Cache }
  vi.stubGlobal('caches', cacheStorage)
}

describe('cloudflareCache', () => {
  let mockCache: MockCache

  beforeEach(() => {
    mockCache = createMockCache()
    installCaches(mockCache)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('withCacheAndContext', () => {
    it('stores the response via ExecutionContext.waitUntil', async () => {
      const waitUntil = vi.fn()
      const request = new Request('https://hidetaka.dev/api/thumbnail/events/123')
      const responseBody = new Uint8Array([1, 2, 3])

      const result = await withCacheAndContext(
        request,
        { waitUntil },
        async () =>
          new Response(responseBody, {
            status: 200,
            headers: { 'Content-Type': 'image/png' },
          }),
      )

      expect(result.status).toBe(200)
      expect(waitUntil).toHaveBeenCalledTimes(1)
      expect(mockCache.put).toHaveBeenCalledTimes(1)
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('supports OpenNext CloudflareContext shape with ctx.waitUntil', async () => {
      const waitUntil = vi.fn()
      const request = new Request('https://hidetaka.dev/api/thumbnail/thoughts/456')

      await withCacheAndContext(
        request,
        { ctx: { waitUntil } },
        async () => new Response('image', { status: 200 }),
      )

      expect(waitUntil).toHaveBeenCalledTimes(1)
      expect(mockCache.put).toHaveBeenCalledTimes(1)
      expect(logger.warn).not.toHaveBeenCalled()
    })

    it('uses a GET-only cache key derived from the request URL', async () => {
      const waitUntil = vi.fn()
      const request = new Request('https://hidetaka.dev/api/thumbnail/dev-notes/789', {
        method: 'GET',
        headers: { Authorization: 'Bearer secret' },
      })

      await withCacheAndContext(
        request,
        { waitUntil },
        async () => new Response('image', { status: 200 }),
      )

      const cacheKey = mockCache.match.mock.calls[0][0] as Request
      expect(cacheKey.method).toBe('GET')
      expect(cacheKey.url).toBe('https://hidetaka.dev/api/thumbnail/dev-notes/789')
      expect(cacheKey.headers.get('Authorization')).toBeNull()
    })

    it('returns cached responses without invoking the callback', async () => {
      const cached = new Response('cached-image', { status: 200 })
      mockCache.match.mockResolvedValue(cached)
      const callback = vi.fn()

      const result = await withCacheAndContext(
        new Request('https://hidetaka.dev/api/thumbnail/events/1'),
        { waitUntil: vi.fn() },
        callback,
      )

      expect(result).toBe(cached)
      expect(callback).not.toHaveBeenCalled()
    })

    it('falls back to callback when caches API is unavailable', async () => {
      vi.stubGlobal('caches', undefined)

      const callback = vi.fn().mockResolvedValue(new Response('fresh', { status: 200 }))
      const result = await withCache(
        new Request('https://hidetaka.dev/api/thumbnail/events/1'),
        callback,
      )

      expect(result.status).toBe(200)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(logger.warn).not.toHaveBeenCalled()
    })
  })
})
