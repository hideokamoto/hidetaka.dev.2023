import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import { buildGoldUrl, DEFAULT_CONTENT_LAKE_GOLD_URL, fetchGold, readGoldBaseUrl } from './client'

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const okResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('readGoldBaseUrl', () => {
  it('falls back to the production URL when the env var is unset', () => {
    expect(readGoldBaseUrl()).toBe(DEFAULT_CONTENT_LAKE_GOLD_URL)
  })

  it('uses CONTENT_LAKE_GOLD_URL when set', () => {
    vi.stubEnv('CONTENT_LAKE_GOLD_URL', 'https://staging-lake.example.com')
    expect(readGoldBaseUrl()).toBe('https://staging-lake.example.com')
  })

  it('strips trailing slashes', () => {
    vi.stubEnv('CONTENT_LAKE_GOLD_URL', 'https://staging-lake.example.com///')
    expect(readGoldBaseUrl()).toBe('https://staging-lake.example.com')
  })

  it('prefixes https:// when the value has no scheme', () => {
    vi.stubEnv('CONTENT_LAKE_GOLD_URL', 'staging-lake.example.com')
    expect(readGoldBaseUrl()).toBe('https://staging-lake.example.com')
  })
})

describe('buildGoldUrl', () => {
  it('appends the file name to the base URL', () => {
    expect(buildGoldUrl('https://lake.example.com', 'about.json')).toBe(
      'https://lake.example.com/about.json',
    )
    expect(buildGoldUrl('https://lake.example.com/', 'meta.json')).toBe(
      'https://lake.example.com/meta.json',
    )
  })
})

describe('fetchGold', () => {
  it('returns parsed data when the response is ok and valid', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse({ hello: 'world' }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const data = await fetchGold('about.json', { revalidate: 60, validate: isRecord })
    expect(data).toEqual({ hello: 'world' })
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake.hidetaka.dev/about.json',
      expect.objectContaining({ next: { revalidate: 60 } }),
    )
  })

  it('returns null when the payload fails validation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse(['not', 'an', 'object']))
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    const isFoo = (data: unknown): data is { foo: string } =>
      isRecord(data) && typeof data.foo === 'string'
    const data = await fetchGold('about.json', { revalidate: 60, validate: isFoo })
    expect(data).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    const data = await fetchGold('about.json', { revalidate: 60, validate: isRecord })
    expect(data).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('returns null when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {})

    const data = await fetchGold('about.json', { revalidate: 60, validate: isRecord })
    expect(data).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('honours CONTENT_LAKE_GOLD_URL for the request URL', async () => {
    vi.stubEnv('CONTENT_LAKE_GOLD_URL', 'lake-staging.example.com')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse({ hello: 'world' }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await fetchGold('writing.json', { revalidate: 60, validate: isRecord })
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake-staging.example.com/writing.json',
      expect.anything(),
    )
  })
})
