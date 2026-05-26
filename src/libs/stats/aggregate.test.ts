import { describe, expect, it } from 'vitest'
import {
  cumulativeTotal,
  earliestDate,
  groupByMonth,
  type StatsInput,
  weeklyStreak,
  yearlySummary,
} from './aggregate'

const post = (datetime: string, name = 'Qiita'): StatsInput => ({
  datetime,
  dataSource: { name },
})

describe('groupByMonth', () => {
  it('returns empty buckets for no items', () => {
    const now = new Date('2025-03-15T00:00:00Z')
    const result = groupByMonth([], 3, now)
    expect(result.map((b) => b.yearMonth)).toEqual(['2025-01', '2025-02', '2025-03'])
    expect(result.every((b) => b.total === 0)).toBe(true)
  })

  it('buckets items into the correct month and counts by source', () => {
    const now = new Date('2025-03-15T00:00:00Z')
    const items = [
      post('2025-03-01T10:00:00Z', 'Qiita'),
      post('2025-03-20T10:00:00Z', 'Zenn'),
      post('2025-02-10T10:00:00Z', 'Qiita'),
    ]
    const result = groupByMonth(items, 3, now)
    const march = result.find((b) => b.yearMonth === '2025-03')
    const feb = result.find((b) => b.yearMonth === '2025-02')
    expect(march?.total).toBe(2)
    expect(march?.bySource).toEqual({ Qiita: 1, Zenn: 1 })
    expect(feb?.total).toBe(1)
    expect(feb?.bySource).toEqual({ Qiita: 1 })
  })

  it('drops items outside the window', () => {
    const now = new Date('2025-03-15T00:00:00Z')
    const result = groupByMonth([post('2024-01-01T00:00:00Z')], 3, now)
    expect(result.reduce((sum, b) => sum + b.total, 0)).toBe(0)
  })

  it('spans year boundaries in chronological order', () => {
    const now = new Date('2025-01-15T00:00:00Z')
    const result = groupByMonth([], 3, now)
    expect(result.map((b) => b.yearMonth)).toEqual(['2024-11', '2024-12', '2025-01'])
  })

  it('ignores invalid dates', () => {
    const now = new Date('2025-03-15T00:00:00Z')
    const result = groupByMonth([post('not-a-date')], 3, now)
    expect(result.reduce((sum, b) => sum + b.total, 0)).toBe(0)
  })
})

describe('yearlySummary', () => {
  it('counts per year, descending', () => {
    const items = [
      post('2024-01-01T00:00:00Z'),
      post('2024-12-31T00:00:00Z'),
      post('2023-06-01T00:00:00Z'),
      post('2025-02-01T00:00:00Z'),
    ]
    expect(yearlySummary(items)).toEqual([
      { year: 2025, count: 1 },
      { year: 2024, count: 2 },
      { year: 2023, count: 1 },
    ])
  })

  it('returns empty array for no items', () => {
    expect(yearlySummary([])).toEqual([])
  })
})

describe('cumulativeTotal', () => {
  it('counts valid-dated items', () => {
    expect(cumulativeTotal([post('2024-01-01T00:00:00Z'), post('bad')])).toBe(1)
  })

  it('is zero for empty input', () => {
    expect(cumulativeTotal([])).toBe(0)
  })
})

describe('earliestDate', () => {
  it('returns the oldest valid date', () => {
    const items = [post('2024-05-01T00:00:00Z'), post('2023-02-01T00:00:00Z')]
    expect(earliestDate(items)?.toISOString()).toBe('2023-02-01T00:00:00.000Z')
  })

  it('returns null when there are no valid items', () => {
    expect(earliestDate([post('bad')])).toBeNull()
  })
})

describe('weeklyStreak', () => {
  it('returns zeros for no items', () => {
    expect(weeklyStreak([], new Date('2025-03-15T00:00:00Z'))).toEqual({
      currentWeeks: 0,
      longestWeeks: 0,
    })
  })

  it('counts a single week as streak of 1', () => {
    // 2025-03-12 is a Wednesday; now in same ISO week
    const now = new Date('2025-03-12T00:00:00Z')
    expect(weeklyStreak([post('2025-03-10T00:00:00Z')], now)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    })
  })

  it('counts consecutive weeks for current streak', () => {
    const now = new Date('2025-03-19T00:00:00Z') // ISO week of Mar 17-23
    const items = [
      post('2025-03-18T00:00:00Z'), // current week
      post('2025-03-11T00:00:00Z'), // previous week
      post('2025-03-04T00:00:00Z'), // two weeks prior
    ]
    expect(weeklyStreak(items, now)).toEqual({ currentWeeks: 3, longestWeeks: 3 })
  })

  it('treats last week as still active when current week has no post', () => {
    const now = new Date('2025-03-19T00:00:00Z')
    const items = [post('2025-03-11T00:00:00Z'), post('2025-03-04T00:00:00Z')]
    expect(weeklyStreak(items, now).currentWeeks).toBe(2)
  })

  it('breaks the current streak when the gap is more than one week', () => {
    const now = new Date('2025-03-26T00:00:00Z')
    // last post was two weeks before current week → not active
    const items = [post('2025-03-04T00:00:00Z'), post('2025-02-25T00:00:00Z')]
    const result = weeklyStreak(items, now)
    expect(result.currentWeeks).toBe(0)
    expect(result.longestWeeks).toBe(2)
  })

  it('finds the longest run even when not current', () => {
    const now = new Date('2025-06-01T00:00:00Z')
    const items = [
      post('2025-01-06T00:00:00Z'),
      post('2025-01-13T00:00:00Z'),
      post('2025-01-20T00:00:00Z'),
      post('2025-03-03T00:00:00Z'),
    ]
    expect(weeklyStreak(items, now).longestWeeks).toBe(3)
  })

  it('handles multiple posts in the same week as one', () => {
    const now = new Date('2025-03-14T00:00:00Z')
    const items = [post('2025-03-10T00:00:00Z'), post('2025-03-12T00:00:00Z')]
    expect(weeklyStreak(items, now)).toEqual({ currentWeeks: 1, longestWeeks: 1 })
  })

  it('counts consecutive weeks across a year boundary', () => {
    const now = new Date('2025-01-02T00:00:00Z') // ISO week containing Dec 30 2024 - Jan 5 2025
    const items = [post('2025-01-01T00:00:00Z'), post('2024-12-25T00:00:00Z')]
    expect(weeklyStreak(items, now)).toEqual({ currentWeeks: 2, longestWeeks: 2 })
  })
})
