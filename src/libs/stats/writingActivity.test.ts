import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ContentIndexGold, WritingGold } from '@/libs/contentLake/types'

vi.mock('@/libs/contentLake/writing', () => ({
  loadWritingGold: vi.fn(),
}))
vi.mock('@/libs/contentLake/contentIndex', () => ({
  loadContentIndexGold: vi.fn(),
}))

import { loadContentIndexGold } from '@/libs/contentLake/contentIndex'
import { loadWritingGold } from '@/libs/contentLake/writing'
import {
  loadWritingActivity,
  STATS_WINDOW_MONTHS,
  toAllTimeStats,
  toMonthlyBuckets,
  toSourceCoverage,
  toWritingActivity,
} from './writingActivity'

const loadWritingGoldMock = vi.mocked(loadWritingGold)
const loadContentIndexGoldMock = vi.mocked(loadContentIndexGold)

const NOW = new Date('2026-09-23T12:00:00.000Z')

const baseWriting: WritingGold = {
  schemaVersion: 1,
  target: 'hidetaka.dev',
  generatedAt: '2026-09-23T01:30:00.801Z',
  monthly: [
    { year: 2025, month: 8, total: 7, bySource: { wordpress: 7 } }, // outside 12-month window
    { year: 2025, month: 10, total: 3, bySource: { wordpress: 2, qiita: 1 } },
    { year: 2026, month: 3, total: 5, bySource: { zenn: 2, devto: 1, wordpress: 2 } },
    { year: 2026, month: 9, total: 4, bySource: { wordpress: 4 } },
  ],
  topTags: [{ tag: 'TypeScript', count: 50 }],
  coverage: { wordpress: 2013, qiita: 2013, zenn: 2020, devto: 2018 },
  firstPublishedAt: '2013-06-26T01:13:28.000Z',
  lastPublishedAt: '2026-09-22T02:57:00.000Z',
  totals: { articleCount: 1856, bySource: { wordpress: 1395 } },
}

const baseIndex: ContentIndexGold = {
  target: 'hidetaka.dev',
  updatedAt: '2026-09-23T07:53:39.061Z',
  itemCount: 4,
  items: [
    {
      id: 'wordpress:1',
      title: 'Article A',
      url: 'https://example.com/a',
      publishedAt: '2026-09-22T02:57:00.000Z',
      source: 'wordpress',
      type: 'article',
    },
    {
      id: 'wordpress:2',
      title: 'Article B',
      url: 'https://example.com/b',
      publishedAt: '2026-09-15T02:57:00.000Z',
      source: 'wordpress',
      type: 'article',
    },
    {
      id: 'github-release:3',
      title: 'Release C',
      url: 'https://example.com/c',
      publishedAt: '2026-09-08T02:57:00.000Z',
      source: 'github-release',
      type: 'release',
    },
  ],
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('toMonthlyBuckets', () => {
  it('returns a zero-filled oldest→newest window ending at now', () => {
    const buckets = toMonthlyBuckets(baseWriting.monthly, 12, NOW)

    expect(buckets).toHaveLength(12)
    expect(buckets[0].yearMonth).toBe('2025-10')
    expect(buckets[11].yearMonth).toBe('2026-09')
    // zero-filled months inside the window
    const nov = buckets.find((b) => b.yearMonth === '2025-11')
    expect(nov).toEqual({ yearMonth: '2025-11', total: 0, bySource: {} })
  })

  it('ignores months outside the window', () => {
    const buckets = toMonthlyBuckets(baseWriting.monthly, 12, NOW)
    expect(buckets.every((b) => b.yearMonth >= '2025-10')).toBe(true)
  })

  it('maps source keys through GOLD_SOURCE_LABELS', () => {
    const buckets = toMonthlyBuckets(baseWriting.monthly, 12, NOW)
    const oct = buckets.find((b) => b.yearMonth === '2025-10')
    expect(oct?.bySource).toEqual({ WordPress: 2, Qiita: 1 })
    const mar = buckets.find((b) => b.yearMonth === '2026-03')
    expect(mar?.bySource).toEqual({ Zenn: 2, 'Dev.to': 1, WordPress: 2 })
  })

  it('keeps unknown source keys as-is', () => {
    const monthly = [{ year: 2026, month: 9, total: 1, bySource: { medium: 1 } }]
    const buckets = toMonthlyBuckets(monthly, 12, NOW)
    expect(buckets[11].bySource).toEqual({ medium: 1 })
  })
})

describe('toWritingActivity', () => {
  it('sums the window total and lists sources in order of first appearance', () => {
    const activity = toWritingActivity(baseWriting, baseIndex, NOW)
    expect(activity.total).toBe(3 + 5 + 4)
    expect(activity.sources).toEqual(['WordPress', 'Qiita', 'Zenn', 'Dev.to'])
  })

  it('computes the streak from article items only', () => {
    const activity = toWritingActivity(baseWriting, baseIndex, NOW)
    expect(activity.streak).not.toBeNull()
    // articles on 9/22 and 9/15 → at least a 2-week current streak
    expect(activity.streak?.currentWeeks).toBeGreaterThanOrEqual(2)
  })

  it('ignores non-article items when computing the streak', () => {
    const indexWithOnlyRelease: ContentIndexGold = {
      ...baseIndex,
      items: [baseIndex.items[2]],
    }
    const activity = toWritingActivity(baseWriting, indexWithOnlyRelease, NOW)
    expect(activity.streak).toEqual({ currentWeeks: 0, longestWeeks: 0 })
  })

  it('returns streak null when the index is unavailable', () => {
    const activity = toWritingActivity(baseWriting, null, NOW)
    expect(activity.streak).toBeNull()
    expect(activity.total).toBe(12)
  })
})

describe('loadWritingActivity', () => {
  it('returns null when writing.json is unavailable', async () => {
    loadWritingGoldMock.mockResolvedValue(null)
    loadContentIndexGoldMock.mockResolvedValue(baseIndex)

    await expect(loadWritingActivity(NOW)).resolves.toBeNull()
  })

  it('tolerates a null index (streak becomes null)', async () => {
    loadWritingGoldMock.mockResolvedValue(baseWriting)
    loadContentIndexGoldMock.mockResolvedValue(null)

    const activity = await loadWritingActivity(NOW)
    expect(activity).not.toBeNull()
    expect(activity?.streak).toBeNull()
    expect(activity?.total).toBe(12)
    expect(activity?.monthly).toHaveLength(STATS_WINDOW_MONTHS)
  })

  it('returns full activity when both gold files load', async () => {
    loadWritingGoldMock.mockResolvedValue(baseWriting)
    loadContentIndexGoldMock.mockResolvedValue(baseIndex)

    const activity = await loadWritingActivity(NOW)
    expect(activity?.streak?.currentWeeks).toBeGreaterThanOrEqual(2)
  })
})

describe('toSourceCoverage', () => {
  it('bySource と coverage を合成し、件数の多い順に並べる', () => {
    const rows = toSourceCoverage({ wordpress: 1395, qiita: 400 }, { wordpress: 2013, qiita: 2013 })
    expect(rows.map((r) => r.key)).toEqual(['wordpress', 'qiita'])
    expect(rows[0]).toEqual({
      key: 'wordpress',
      label: 'WordPress',
      count: 1395,
      sinceYear: 2013,
      isPartialCoverage: false,
    })
  })

  it('他媒体より coverage 開始年が遅い媒体を欠測扱い（isPartialCoverage）にする', () => {
    const rows = toSourceCoverage({ wordpress: 1395, zenn: 12 }, { wordpress: 2013, zenn: 2020 })
    const zenn = rows.find((r) => r.key === 'zenn')
    const wordpress = rows.find((r) => r.key === 'wordpress')
    expect(zenn?.isPartialCoverage).toBe(true)
    expect(wordpress?.isPartialCoverage).toBe(false)
  })

  it('npm を除外する（articles のみのはずだが型上は混在できるため防御的に除外）', () => {
    const rows = toSourceCoverage({ wordpress: 10, npm: 999 }, { wordpress: 2013, npm: 2015 })
    expect(rows.some((r) => r.key === 'npm')).toBe(false)
    expect(rows.map((r) => r.key)).toEqual(['wordpress'])
  })

  it('coverage に無い媒体は sinceYear が null で isPartialCoverage は false', () => {
    const rows = toSourceCoverage({ medium: 3 }, {})
    expect(rows).toEqual([
      { key: 'medium', label: 'medium', count: 3, sinceYear: null, isPartialCoverage: false },
    ])
  })

  it('空の入力では空配列を返す', () => {
    expect(toSourceCoverage({}, {})).toEqual([])
  })
})

describe('toAllTimeStats', () => {
  it('writing.json の totals / firstPublishedAt / lastPublishedAt / monthly から全期間統計を組み立てる', () => {
    const allTime = toAllTimeStats(baseWriting)

    expect(allTime.totalArticles).toBe(1856)
    expect(allTime.firstPublishedAt).toBe('2013-06-26T01:13:28.000Z')
    expect(allTime.lastPublishedAt).toBe('2026-09-22T02:57:00.000Z')
    expect(allTime.bySource.map((r) => r.key)).toEqual(['wordpress'])
    expect(allTime.yearly.length).toBeGreaterThan(0)
  })

  it('npm が totals.bySource に混在していても除外する', () => {
    const withNpm: WritingGold = {
      ...baseWriting,
      totals: { articleCount: 1856, bySource: { wordpress: 1395, npm: 5 } },
    }
    const allTime = toAllTimeStats(withNpm)
    expect(allTime.bySource.some((r) => r.key === 'npm')).toBe(false)
  })

  it('記事が1件も無いとき（totals.articleCount 0, monthly 空）は空の全期間統計を返す', () => {
    const empty: WritingGold = {
      schemaVersion: 1,
      target: 'hidetaka.dev',
      generatedAt: '2026-09-23T01:30:00.000Z',
      monthly: [],
      topTags: [],
      coverage: {},
      firstPublishedAt: null,
      lastPublishedAt: null,
      totals: { articleCount: 0, bySource: {} },
    }
    const allTime = toAllTimeStats(empty)
    expect(allTime).toEqual({
      totalArticles: 0,
      firstPublishedAt: null,
      lastPublishedAt: null,
      bySource: [],
      yearly: [],
    })
  })
})

describe('toWritingActivity includes allTime', () => {
  it('allTime を組み込む', () => {
    const activity = toWritingActivity(baseWriting, baseIndex, NOW)
    expect(activity.allTime.totalArticles).toBe(1856)
    expect(activity.allTime.bySource.some((r) => r.key === 'npm')).toBe(false)
  })
})
