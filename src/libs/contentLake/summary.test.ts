import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import { isSummaryGold, loadSummaryGold } from './summary'
import type { SummaryGold } from './types'

const validSummary: SummaryGold = {
  schemaVersion: 2,
  target: 'hidetaka.dev',
  generatedAt: '2026-09-23T01:30:00.801Z',
  range: { from: '2026-08-15', to: '2026-09-23' },
  articles: {
    total: 1856,
    firstYear: 2013,
    firstYearBySource: { wordpress: 2013, qiita: 2013 },
    bySource: { wordpress: 1395, qiita: 428 },
    byYear: [
      { year: 2013, total: 15, bySource: { wordpress: 14, qiita: 1 } },
      { year: 2026, total: 158, bySource: { wordpress: 156 } },
    ],
  },
  events: { total: 27 },
  ossReach: {
    'github:__aggregate__:repository-count': {
      metricId: 'github:__aggregate__:repository-count',
      latest: { date: '2026-09-23', value: 185 },
      series: [
        { date: '2026-09-22', value: 184 },
        { date: '2026-09-23', value: 185 },
      ],
    },
    'qiita:hideokamoto:followers': {
      metricId: 'qiita:hideokamoto:followers',
      latest: { date: '2026-09-23', value: 512 },
      series: [{ date: '2026-09-23', value: 512 }],
    },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isSummaryGold', () => {
  it('accepts a valid SummaryGold payload', () => {
    expect(isSummaryGold(validSummary)).toBe(true)
  })

  it('accepts an empty ossReach map', () => {
    expect(isSummaryGold({ ...validSummary, ossReach: {} })).toBe(true)
  })

  it('rejects null', () => {
    expect(isSummaryGold(null)).toBe(false)
  })

  it('rejects schemaVersion 1', () => {
    expect(isSummaryGold({ ...validSummary, schemaVersion: 1 })).toBe(false)
  })

  it('rejects missing ossReach', () => {
    const { ossReach: _ossReach, ...rest } = validSummary
    expect(isSummaryGold(rest)).toBe(false)
  })

  it('rejects a metric without a latest point', () => {
    expect(
      isSummaryGold({
        ...validSummary,
        ossReach: {
          'github:a/b:stars': { metricId: 'github:a/b:stars', series: [] },
        },
      }),
    ).toBe(false)
  })

  it('rejects a metric with malformed series points', () => {
    expect(
      isSummaryGold({
        ...validSummary,
        ossReach: {
          'github:a/b:stars': {
            metricId: 'github:a/b:stars',
            latest: { date: '2026-09-23', value: 1 },
            series: [{ date: '2026-09-23', value: '1' }],
          },
        },
      }),
    ).toBe(false)
  })
})

describe('loadSummaryGold', () => {
  it('returns the parsed SummaryGold on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(validSummary), { status: 200 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const summary = await loadSummaryGold()
    expect(summary).toEqual(validSummary)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake.hidetaka.dev/summary.json',
      expect.objectContaining({ next: { revalidate: 86400 } }),
    )
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await expect(loadSummaryGold()).resolves.toBeNull()
  })
})
