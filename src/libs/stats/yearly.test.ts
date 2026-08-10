import { describe, expect, it } from 'vitest'
import { activeYearSpan, buildYearlySeries, firstYear, peakCount } from './yearly'

const NOW = new Date('2026-08-10T00:00:00Z')

describe('firstYear', () => {
  it('最も古い年を返す', () => {
    expect(firstYear(['2020-05-01T00:00:00Z', '2013-09-18T00:05:14', '2018-01-01'])).toBe(2013)
  })

  it('有効な日付が無ければ null を返す', () => {
    expect(firstYear([])).toBeNull()
    expect(firstYear(['not-a-date', ''])).toBeNull()
  })

  it('不正な日付を無視する', () => {
    expect(firstYear(['broken', '2019-03-01T00:00:00Z'])).toBe(2019)
  })
})

describe('activeYearSpan', () => {
  it('開始年と現在年の両端を含めて数える', () => {
    expect(activeYearSpan(['2013-09-18T00:05:14'], NOW)).toBe(14)
  })

  it('同じ年に開始していれば 1 年', () => {
    expect(activeYearSpan(['2026-01-05T00:00:00Z'], NOW)).toBe(1)
  })

  it('有効な日付が無ければ 0 を返す', () => {
    expect(activeYearSpan([], NOW)).toBe(0)
  })

  it('未来の日付しか無くても 1 を下回らない', () => {
    expect(activeYearSpan(['2030-01-01T00:00:00Z'], NOW)).toBe(1)
  })
})

describe('buildYearlySeries', () => {
  it('新しい年から順に、件数と累計を返す', () => {
    const series = buildYearlySeries(
      [
        '2024-01-01T00:00:00Z',
        '2024-06-01T00:00:00Z',
        '2026-02-01T00:00:00Z',
        '2025-07-01T00:00:00Z',
      ],
      NOW,
    )

    expect(series.map((row) => row.year)).toEqual([2026, 2025, 2024])
    expect(series.map((row) => row.count)).toEqual([1, 1, 2])
    // 累計は古い年から積み上げるので、新しい年ほど大きい
    expect(series.map((row) => row.cumulative)).toEqual([4, 3, 2])
  })

  it('投稿の無い年も 0 で補完する', () => {
    const series = buildYearlySeries(['2023-01-01T00:00:00Z', '2026-01-01T00:00:00Z'], NOW)

    expect(series.map((row) => row.year)).toEqual([2026, 2025, 2024, 2023])
    expect(series.map((row) => row.count)).toEqual([1, 0, 0, 1])
    expect(series.map((row) => row.cumulative)).toEqual([2, 1, 1, 1])
  })

  it('最新の投稿が過去年でも現在年まで並べる', () => {
    const series = buildYearlySeries(['2024-01-01T00:00:00Z'], NOW)
    expect(series[0]?.year).toBe(2026)
    expect(series[0]?.count).toBe(0)
    expect(series[0]?.cumulative).toBe(1)
  })

  it('未来日付の投稿も系列に含める', () => {
    const series = buildYearlySeries(['2026-01-01T00:00:00Z', '2027-05-01T00:00:00Z'], NOW)
    expect(series[0]?.year).toBe(2027)
    expect(series[0]?.count).toBe(1)
  })

  it('有効な日付が無ければ空配列を返す', () => {
    expect(buildYearlySeries([], NOW)).toEqual([])
    expect(buildYearlySeries(['broken'], NOW)).toEqual([])
  })

  it('タイムゾーンに依存せず UTC の年で集計する', () => {
    // JST では 2025-01-01、UTC では 2024-12-31
    const series = buildYearlySeries(['2024-12-31T23:00:00Z'], new Date('2024-12-31T23:30:00Z'))
    expect(series).toEqual([{ year: 2024, count: 1, cumulative: 1 }])
  })
})

describe('peakCount', () => {
  it('系列中の最大件数を返す', () => {
    expect(peakCount(buildYearlySeries(['2025-01-01', '2025-02-01', '2026-01-01'], NOW))).toBe(2)
  })

  it('空の系列では 0 を返す', () => {
    expect(peakCount([])).toBe(0)
  })
})
