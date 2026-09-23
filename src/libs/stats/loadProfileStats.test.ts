import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AboutGold } from '@/libs/contentLake/types'

vi.mock('@/libs/contentLake/about', () => ({
  loadAboutGold: vi.fn(),
}))

import { loadAboutGold } from '@/libs/contentLake/about'
import { hasAnyProfileStat, loadProfileStats, toProfileStats } from './loadProfileStats'

const loadAboutGoldMock = vi.mocked(loadAboutGold)

const validAbout: AboutGold = {
  schemaVersion: 1,
  target: 'hidetaka',
  generatedAt: '2026-02-03T00:00:00.000Z',
  writing: {
    source: 'wordpress',
    total: 1395,
    firstYear: 2013,
    yearsActive: 14,
    byYear: [
      { year: 2013, count: 10, cumulative: 10 },
      { year: 2014, count: 20, cumulative: 30 },
      { year: 2015, count: 5, cumulative: 35 },
    ],
  },
  speaking: { reports: 27 },
  oss: {
    npm: { packages: { value: 58, asOf: '2026-02-01' } },
    wordpressOrg: {
      plugins: 5,
      activeInstalls: { value: 59250, asOf: '2026-02-01' },
      downloads: { value: 839504, asOf: '2026-02-01' },
    },
  },
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('toProfileStats', () => {
  it('maps a full AboutGold payload to ProfileStats', () => {
    const stats = toProfileStats(validAbout)

    expect(stats.writing).toEqual({
      total: 1395,
      firstYear: 2013,
      yearsActive: 14,
      series: [
        { year: 2015, count: 5, cumulative: 35 },
        { year: 2014, count: 20, cumulative: 30 },
        { year: 2013, count: 10, cumulative: 10 },
      ],
    })
    expect(stats.speakingReports).toBe(27)
    expect(stats.oss).toEqual({
      npmPackages: 58,
      wpPlugins: 5,
      activeInstalls: 59250,
      downloads: 839504,
    })
  })

  it('returns writing null when about.writing is null', () => {
    const stats = toProfileStats({ ...validAbout, writing: null })
    expect(stats.writing).toBeNull()
  })

  it('returns writing null when byYear is empty', () => {
    const writing = { ...(validAbout.writing as NonNullable<AboutGold['writing']>), byYear: [] }
    const stats = toProfileStats({ ...validAbout, writing })
    expect(stats.writing).toBeNull()
  })

  it('returns oss null when npm is null', () => {
    const stats = toProfileStats({
      ...validAbout,
      oss: { ...validAbout.oss, npm: null },
    })
    expect(stats.oss).toBeNull()
  })

  it('returns oss null when wordpressOrg is null', () => {
    const stats = toProfileStats({
      ...validAbout,
      oss: { ...validAbout.oss, wordpressOrg: null },
    })
    expect(stats.oss).toBeNull()
  })
})

describe('loadProfileStats', () => {
  it('resolves mapped stats from the gold file', async () => {
    loadAboutGoldMock.mockResolvedValue(validAbout)

    const stats = await loadProfileStats()
    expect(loadAboutGoldMock).toHaveBeenCalled()
    expect(stats.writing?.total).toBe(1395)
    expect(stats.speakingReports).toBe(27)
    expect(stats.oss?.npmPackages).toBe(58)
  })

  it('returns all-null stats when the gold file is unavailable', async () => {
    loadAboutGoldMock.mockResolvedValue(null)

    const stats = await loadProfileStats()
    expect(stats).toEqual({ writing: null, speakingReports: null, oss: null })
  })
})

describe('hasAnyProfileStat', () => {
  it('returns false when everything is null', () => {
    expect(hasAnyProfileStat({ writing: null, speakingReports: null, oss: null })).toBe(false)
  })

  it('returns false when speakingReports is 0', () => {
    expect(hasAnyProfileStat({ writing: null, speakingReports: 0, oss: null })).toBe(false)
  })

  it('returns true when speakingReports is positive', () => {
    expect(hasAnyProfileStat({ writing: null, speakingReports: 3, oss: null })).toBe(true)
  })

  it('returns true when writing stats exist', () => {
    expect(
      hasAnyProfileStat({
        writing: { total: 10, firstYear: 2020, yearsActive: 2, series: [] },
        speakingReports: null,
        oss: null,
      }),
    ).toBe(true)
  })
})
