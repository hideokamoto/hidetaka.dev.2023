import { describe, expect, it } from 'vitest'
import {
  activityLevel,
  buildActivityCalendar,
  calendarMonthLabels,
  cumulativeTotal,
  groupByMonth,
  type StatsInput,
  weeklyStreak,
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

describe('cumulativeTotal', () => {
  it('counts valid-dated items', () => {
    expect(cumulativeTotal([post('2024-01-01T00:00:00Z'), post('bad')])).toBe(1)
  })

  it('is zero for empty input', () => {
    expect(cumulativeTotal([])).toBe(0)
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
    const now = new Date('2025-03-12T00:00:00Z')
    expect(weeklyStreak([post('2025-03-10T00:00:00Z')], now)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    })
  })

  it('counts consecutive rolling weeks for current streak', () => {
    const now = new Date('2025-03-19T00:00:00Z')
    const items = [
      post('2025-03-18T00:00:00Z'), // within last 7 days
      post('2025-03-11T00:00:00Z'), // 7–14 days ago
      post('2025-03-04T00:00:00Z'), // 14–21 days ago
    ]
    expect(weeklyStreak(items, now)).toEqual({ currentWeeks: 3, longestWeeks: 3 })
  })

  it('treats 7–14 days ago as still active when last 7 days have no post', () => {
    const now = new Date('2025-03-19T00:00:00Z')
    const items = [post('2025-03-11T00:00:00Z'), post('2025-03-04T00:00:00Z')]
    expect(weeklyStreak(items, now).currentWeeks).toBe(2)
  })

  it('breaks the current streak when the gap is more than 14 days', () => {
    const now = new Date('2025-03-26T00:00:00Z')
    const items = [post('2025-03-04T00:00:00Z'), post('2025-02-25T00:00:00Z')]
    const result = weeklyStreak(items, now)
    expect(result.currentWeeks).toBe(0)
    expect(result.longestWeeks).toBe(2)
  })

  it('keeps streak active when last post is 8–14 days ago (calendar week would break)', () => {
    const now = new Date('2026-05-27T00:00:00Z')
    const items = [post('2026-05-17T08:55:36Z'), post('2026-05-10T00:00:00Z')]
    expect(weeklyStreak(items, now).currentWeeks).toBeGreaterThan(0)
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

  it('counts consecutive rolling weeks across a year boundary', () => {
    const now = new Date('2025-01-02T00:00:00Z')
    const items = [post('2025-01-01T00:00:00Z'), post('2024-12-25T00:00:00Z')]
    expect(weeklyStreak(items, now)).toEqual({ currentWeeks: 2, longestWeeks: 2 })
  })
})

describe('activityLevel', () => {
  it('returns 0 for zero count or max', () => {
    expect(activityLevel(0, 10)).toBe(0)
    expect(activityLevel(5, 0)).toBe(0)
  })

  it('maps counts to quartile levels', () => {
    expect(activityLevel(1, 8)).toBe(1)
    expect(activityLevel(3, 8)).toBe(2)
    expect(activityLevel(6, 8)).toBe(3)
    expect(activityLevel(8, 8)).toBe(4)
  })
})

describe('buildActivityCalendar', () => {
  it('returns empty-level grid for no items', () => {
    const now = new Date('2025-03-15T12:00:00Z')
    const { columns, maxCount } = buildActivityCalendar([], 4, now)
    expect(maxCount).toBe(0)
    expect(columns).toHaveLength(4)
    expect(columns.every((week) => week.every((cell) => cell.count === 0))).toBe(true)
  })

  it('counts multiple posts on the same day', () => {
    const now = new Date('2025-03-15T12:00:00Z')
    const items = [post('2025-03-10T10:00:00Z'), post('2025-03-10T18:00:00Z')]
    const { columns, maxCount } = buildActivityCalendar(items, 8, now)
    expect(maxCount).toBe(2)
    const allCells = columns.flat()
    const target = allCells.find((c) => c.date === '2025-03-10')
    expect(target?.count).toBe(2)
    expect(target?.level).toBe(4)
  })

  it('marks future days and excludes them from counts', () => {
    const now = new Date('2025-03-15T12:00:00Z')
    const { columns } = buildActivityCalendar([post('2025-03-20T00:00:00Z')], 4, now)
    const futureCells = columns.flat().filter((c) => c.isFuture)
    expect(futureCells.length).toBeGreaterThan(0)
    expect(futureCells.every((c) => c.count === 0)).toBe(true)
  })
})

describe('calendarMonthLabels', () => {
  it('emits a label for the first month in the grid', () => {
    const now = new Date('2025-03-15T12:00:00Z')
    const { columns } = buildActivityCalendar([], 8, now)
    const labels = calendarMonthLabels(columns, 'en')
    expect(labels.length).toBeGreaterThan(0)
    expect(labels[0].weekIndex).toBeGreaterThanOrEqual(0)
  })
})
