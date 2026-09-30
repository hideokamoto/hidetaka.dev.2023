import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSummaryGold } from '@/libs/contentLake/summary'
import type { OssReachMetric } from '@/libs/contentLake/types'
import { loadOssReach, toOssReachTrends } from './ossReach'

vi.mock('@/libs/contentLake/summary', () => ({
  loadSummaryGold: vi.fn(),
}))

const metric = (metricId: string, series: { date: string; value: number }[]): OssReachMetric => ({
  metricId,
  latest: series[series.length - 1] ?? { date: '', value: 0 },
  series,
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('toOssReachTrends', () => {
  it('returns an empty array when ossReach is empty', () => {
    expect(toOssReachTrends({})).toEqual([])
  })

  it('maps a single aggregate metric to its trend id', () => {
    const trends = toOssReachTrends({
      'github:__aggregate__:repository-count': metric('github:__aggregate__:repository-count', [
        { date: '2026-09-20', value: 180 },
        { date: '2026-09-21', value: 185 },
      ]),
    })
    const repos = trends.find((t) => t.id === 'github-repos')
    expect(repos).toBeDefined()
    expect(repos?.latest).toBe(185)
    expect(repos?.latestDate).toBe('2026-09-21')
    expect(repos?.delta).toBe(5)
  })

  it('sums subject-level metrics by date', () => {
    const trends = toOssReachTrends({
      'wordpress-org:plugin-a:active-installs': metric('wordpress-org:plugin-a:active-installs', [
        { date: '2026-09-20', value: 100 },
        { date: '2026-09-21', value: 110 },
      ]),
      'wordpress-org:plugin-b:active-installs': metric('wordpress-org:plugin-b:active-installs', [
        { date: '2026-09-20', value: 200 },
        { date: '2026-09-21', value: 210 },
      ]),
    })
    const installs = trends.find((t) => t.id === 'wporg-installs')
    expect(installs?.series).toEqual([
      { date: '2026-09-20', value: 300 },
      { date: '2026-09-21', value: 320 },
    ])
  })

  it('backward-fills a metric that starts later than others', () => {
    const trends = toOssReachTrends({
      'github:hideokamoto/old:stars': metric('github:hideokamoto/old:stars', [
        { date: '2026-09-19', value: 10 },
        { date: '2026-09-20', value: 10 },
        { date: '2026-09-21', value: 11 },
      ]),
      // 追跡開始が遅いメトリクスは、観測開始前を最初の観測値で補う
      'github:hideokamoto/new:stars': metric('github:hideokamoto/new:stars', [
        { date: '2026-09-21', value: 5 },
      ]),
    })
    const stars = trends.find((t) => t.id === 'github-stars')
    expect(stars?.series).toEqual([
      { date: '2026-09-19', value: 15 },
      { date: '2026-09-20', value: 15 },
      { date: '2026-09-21', value: 16 },
    ])
  })

  it('carries forward the last value when a metric has no point on a date', () => {
    const trends = toOssReachTrends({
      'qiita:hideokamoto:followers': metric('qiita:hideokamoto:followers', [
        { date: '2026-09-19', value: 500 },
        { date: '2026-09-21', value: 505 },
      ]),
      'qiita:motchi0214:followers': metric('qiita:motchi0214:followers', [
        { date: '2026-09-20', value: 50 },
      ]),
    })
    const followers = trends.find((t) => t.id === 'qiita-followers')
    expect(followers?.series).toEqual([
      { date: '2026-09-19', value: 550 },
      { date: '2026-09-20', value: 550 },
      { date: '2026-09-21', value: 555 },
    ])
  })

  it('separates providers and metric kinds into distinct trend ids', () => {
    const trends = toOssReachTrends({
      'qiita:hideokamoto:followers': metric('qiita:hideokamoto:followers', [
        { date: '2026-09-21', value: 500 },
      ]),
      'qiita:hideokamoto:lgtm-total': metric('qiita:hideokamoto:lgtm-total', [
        { date: '2026-09-21', value: 3000 },
      ]),
      'wordpress-org:p:active-installs': metric('wordpress-org:p:active-installs', [
        { date: '2026-09-21', value: 100 },
      ]),
      'wordpress-org:p:cumulative-downloads': metric('wordpress-org:p:cumulative-downloads', [
        { date: '2026-09-21', value: 9000 },
      ]),
      'npm:__aggregate__:package-count': metric('npm:__aggregate__:package-count', [
        { date: '2026-09-21', value: 58 },
      ]),
    })
    const ids = trends.map((t) => t.id)
    expect(ids).toEqual([
      'qiita-followers',
      'qiita-lgtm',
      'wporg-installs',
      'wporg-downloads',
      'npm-packages',
    ])
  })

  it('ignores unknown providers and kinds', () => {
    const trends = toOssReachTrends({
      'mastodon:hideokamoto:followers': metric('mastodon:hideokamoto:followers', [
        { date: '2026-09-21', value: 10 },
      ]),
      'github:hideokamoto/repo:forks': metric('github:hideokamoto/repo:forks', [
        { date: '2026-09-21', value: 3 },
      ]),
    })
    expect(trends).toEqual([])
  })

  it('skips metrics with an empty series', () => {
    const trends = toOssReachTrends({
      'npm:__aggregate__:package-count': {
        metricId: 'npm:__aggregate__:package-count',
        latest: { date: '2026-09-21', value: 58 },
        series: [],
      },
    })
    expect(trends).toEqual([])
  })
})

describe('loadOssReach', () => {
  it('returns null when summary.json is unavailable', async () => {
    vi.mocked(loadSummaryGold).mockResolvedValue(null)
    await expect(loadOssReach()).resolves.toBeNull()
  })

  it('returns null when no known metrics are present', async () => {
    vi.mocked(loadSummaryGold).mockResolvedValue({
      schemaVersion: 2,
      target: 'hidetaka.dev',
      generatedAt: '2026-09-23T01:30:00.000Z',
      range: { from: '2026-09-01', to: '2026-09-23' },
      articles: {
        total: 0,
        firstYear: null,
        firstYearBySource: {},
        bySource: {},
        byYear: [],
      },
      events: { total: 0 },
      ossReach: {},
    })
    await expect(loadOssReach()).resolves.toBeNull()
  })

  it('returns trends when metrics exist', async () => {
    vi.mocked(loadSummaryGold).mockResolvedValue({
      schemaVersion: 2,
      target: 'hidetaka.dev',
      generatedAt: '2026-09-23T01:30:00.000Z',
      range: { from: '2026-09-01', to: '2026-09-23' },
      articles: {
        total: 0,
        firstYear: null,
        firstYearBySource: {},
        bySource: {},
        byYear: [],
      },
      events: { total: 0 },
      ossReach: {
        'npm:__aggregate__:package-count': metric('npm:__aggregate__:package-count', [
          { date: '2026-09-21', value: 58 },
        ]),
      },
    })
    const trends = await loadOssReach()
    expect(trends?.[0]?.id).toBe('npm-packages')
    expect(trends?.[0]?.latest).toBe(58)
  })
})
