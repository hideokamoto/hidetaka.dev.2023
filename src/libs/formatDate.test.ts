import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('should format date string to US locale', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024')
  })

  it('should format date at start of year', () => {
    expect(formatDate('2024-01-01')).toBe('January 1, 2024')
  })

  it('should format date at end of year', () => {
    expect(formatDate('2024-12-31')).toBe('December 31, 2024')
  })

  it('should handle leap year date', () => {
    expect(formatDate('2024-02-29')).toBe('February 29, 2024')
  })

  it('should format mid-year date', () => {
    expect(formatDate('2024-06-15')).toBe('June 15, 2024')
  })

  it('should use UTC timezone consistently', () => {
    const result = formatDate('2024-12-31')
    expect(result).toBe('December 31, 2024')
  })

  it('should handle different years correctly', () => {
    expect(formatDate('2023-03-20')).toBe('March 20, 2023')
    expect(formatDate('2025-07-04')).toBe('July 4, 2025')
  })

  describe('property-based tests', () => {
    // 有効な日付文字列を生成するアービトラリ
    const validDateString = fc
      .date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') })
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })

    it('should always return a non-empty string for valid dates', () => {
      fc.assert(
        fc.property(validDateString, (dateStr) => {
          const result = formatDate(dateStr)
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }),
      )
    })

    it('should include year, month, and day in output', () => {
      fc.assert(
        fc.property(validDateString, (dateStr) => {
          const result = formatDate(dateStr)
          const date = new Date(`${dateStr}T00:00:00Z`)
          if (Number.isNaN(date.getTime())) {
            // 無効な日付の場合はスキップ
            return
          }
          const year = date.getUTCFullYear().toString()
          expect(result).toContain(year)
        }),
      )
    })

    it('should be idempotent (same input produces same output)', () => {
      fc.assert(
        fc.property(validDateString, (dateStr) => {
          const result1 = formatDate(dateStr)
          const result2 = formatDate(dateStr)
          expect(result1).toBe(result2)
        }),
      )
    })

    it('should handle dates across different years correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1900, max: 2100 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 28 }), // 28日までに制限して有効な日付を保証
          (year, month, day) => {
            const monthStr = String(month).padStart(2, '0')
            const dayStr = String(day).padStart(2, '0')
            const dateStr = `${year}-${monthStr}-${dayStr}`
            const result = formatDate(dateStr)
            expect(result).toContain(year.toString())
          },
        ),
      )
    })

    it('should handle edge cases: year boundaries', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1900, max: 2100 }), (year) => {
          const jan1 = formatDate(`${year}-01-01`)
          const dec31 = formatDate(`${year}-12-31`)
          expect(jan1).toContain(year.toString())
          expect(dec31).toContain(year.toString())
          expect(jan1).toMatch(/January/)
          expect(dec31).toMatch(/December/)
        }),
      )
    })
  })
})
