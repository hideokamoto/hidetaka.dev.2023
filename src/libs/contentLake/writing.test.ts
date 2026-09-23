import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import type { WritingGold } from './types'
import { isWritingGold, loadWritingGold } from './writing'

const validWriting: WritingGold = {
  schemaVersion: 1,
  target: 'hidetaka.dev',
  generatedAt: '2026-09-23T01:30:00.801Z',
  monthly: [
    { year: 2013, month: 6, total: 1, bySource: { qiita: 1 } },
    { year: 2013, month: 7, total: 0, bySource: {} },
    { year: 2013, month: 9, total: 4, bySource: { wordpress: 4 } },
    { year: 2026, month: 9, total: 12, bySource: { wordpress: 8, qiita: 2, zenn: 2 } },
  ],
  topTags: [
    { tag: 'StripeUpdates', count: 52 },
    { tag: 'TypeScript', count: 50 },
  ],
  coverage: { devto: 2018, qiita: 2013, wordpress: 2013, zenn: 2020 },
  firstPublishedAt: '2013-06-26T01:13:28.000Z',
  lastPublishedAt: '2026-09-22T02:57:00.000Z',
  totals: {
    articleCount: 1856,
    bySource: { devto: 6, qiita: 428, wordpress: 1395, zenn: 27 },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isWritingGold', () => {
  it('accepts a valid WritingGold payload', () => {
    expect(isWritingGold(validWriting)).toBe(true)
  })

  it('accepts empty monthly and null published dates', () => {
    expect(
      isWritingGold({
        ...validWriting,
        monthly: [],
        firstPublishedAt: null,
        lastPublishedAt: null,
      }),
    ).toBe(true)
  })

  it('rejects null', () => {
    expect(isWritingGold(null)).toBe(false)
  })

  it('rejects a different schemaVersion', () => {
    expect(isWritingGold({ ...validWriting, schemaVersion: 2 })).toBe(false)
  })

  it('rejects monthly that is not an array', () => {
    expect(isWritingGold({ ...validWriting, monthly: 'nope' })).toBe(false)
  })

  it('rejects a monthly entry without numeric fields', () => {
    expect(
      isWritingGold({
        ...validWriting,
        monthly: [{ year: '2026', month: 9, total: 12, bySource: {} }],
      }),
    ).toBe(false)
  })

  it('rejects a monthly entry without a bySource object', () => {
    expect(
      isWritingGold({
        ...validWriting,
        monthly: [{ year: 2026, month: 9, total: 12, bySource: null }],
      }),
    ).toBe(false)
  })

  it('rejects missing or malformed totals', () => {
    const { totals: _totals, ...rest } = validWriting
    expect(isWritingGold(rest)).toBe(false)
    expect(isWritingGold({ ...validWriting, totals: { bySource: {} } })).toBe(false)
  })
})

describe('loadWritingGold', () => {
  it('returns the parsed WritingGold on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(validWriting), { status: 200 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const writing = await loadWritingGold()
    expect(writing).toEqual(validWriting)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake.hidetaka.dev/writing.json',
      expect.objectContaining({ next: { revalidate: 3600 } }),
    )
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await expect(loadWritingGold()).resolves.toBeNull()
  })
})
