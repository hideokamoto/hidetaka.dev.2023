import { describe, expect, it } from 'vitest'
import {
  formatDateDisplay,
  getDateFormatOptions,
  getDateLocale,
  isValidDate,
  parseDate,
  parseDateAndFormat,
} from './dateDisplay.utils'

describe('DateDisplay Utils', () => {
  describe('parseDate', () => {
    it('should return Date object as is', () => {
      const date = new Date('2024-06-15')
      expect(parseDate(date)).toBe(date)
    })

    it('should parse ISO string to Date object', () => {
      const result = parseDate('2024-06-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(5) // June is month 5 (0-indexed)
      expect(result.getDate()).toBe(15)
    })

    it('should handle various date string formats', () => {
      const isoDate = parseDate('2024-12-25T10:30:00Z')
      expect(isoDate).toBeInstanceOf(Date)

      const shortDate = parseDate('2024-01-01')
      expect(shortDate).toBeInstanceOf(Date)
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date('2024-06-15'))).toBe(true)
      expect(isValidDate(new Date('2000-01-01'))).toBe(true)
      expect(isValidDate(new Date())).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate(new Date('not-a-date'))).toBe(false)
      expect(isValidDate(new Date('2024-13-01'))).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidDate(new Date('2024-02-29'))).toBe(true) // Leap year
      // Note: JavaScript Date automatically adjusts invalid dates like '2023-02-29' to '2023-03-01'
      // So it becomes a valid date. Test with an actually invalid format instead.
      expect(isValidDate(new Date('2023-99-99'))).toBe(false) // Invalid month/day
    })
  })

  describe('getDateLocale', () => {
    it('should return "ja-JP" for Japanese language codes', () => {
      expect(getDateLocale('ja')).toBe('ja-JP')
      expect(getDateLocale('ja-JP')).toBe('ja-JP')
    })

    it('should return "en-US" for English language codes', () => {
      expect(getDateLocale('en')).toBe('en-US')
      expect(getDateLocale('en-US')).toBe('en-US')
      expect(getDateLocale('en-GB')).toBe('en-US')
    })

    it('should return "en-US" for other language codes', () => {
      expect(getDateLocale('fr')).toBe('en-US')
      expect(getDateLocale('de')).toBe('en-US')
      expect(getDateLocale('')).toBe('en-US')
    })
  })

  describe('getDateFormatOptions', () => {
    it('should return correct options for "short" format', () => {
      const options = getDateFormatOptions('short')
      expect(options).toEqual({
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    })

    it('should return correct options for "long" format', () => {
      const options = getDateFormatOptions('long')
      expect(options).toEqual({
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    })

    it('should return correct options for "month-year" format', () => {
      const options = getDateFormatOptions('month-year')
      expect(options).toEqual({
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    })
  })

  describe('formatDateDisplay', () => {
    const testDate = new Date('2024-06-15T12:00:00Z')

    describe('English locale', () => {
      it('should format date in short format', () => {
        const result = formatDateDisplay(testDate, 'en', 'short')
        expect(result).toMatch(/Jun/)
        expect(result).toMatch(/15/)
        expect(result).toMatch(/2024/)
      })

      it('should format date in long format', () => {
        const result = formatDateDisplay(testDate, 'en', 'long')
        expect(result).toMatch(/June/)
        expect(result).toMatch(/15/)
        expect(result).toMatch(/2024/)
      })

      it('should format date in month-year format', () => {
        const result = formatDateDisplay(testDate, 'en', 'month-year')
        expect(result).toMatch(/June/)
        expect(result).toMatch(/2024/)
        expect(result).not.toMatch(/15/)
      })
    })

    describe('Japanese locale', () => {
      it('should format date in short format', () => {
        const result = formatDateDisplay(testDate, 'ja', 'short')
        expect(result).toMatch(/2024/)
        expect(result).toMatch(/6/)
        expect(result).toMatch(/15/)
      })

      it('should format date in long format', () => {
        const result = formatDateDisplay(testDate, 'ja', 'long')
        expect(result).toMatch(/2024/)
        expect(result).toMatch(/6/)
        expect(result).toMatch(/15/)
      })

      it('should format date in month-year format', () => {
        const result = formatDateDisplay(testDate, 'ja', 'month-year')
        expect(result).toMatch(/2024/)
        expect(result).toMatch(/6/)
        expect(result).not.toMatch(/15/)
      })
    })

    it('should use default format when not specified', () => {
      const result = formatDateDisplay(testDate, 'en')
      expect(result).toMatch(/Jun/)
      expect(result).toMatch(/2024/)
    })

    it('should handle different years', () => {
      const date2023 = new Date('2023-01-01')
      const date2025 = new Date('2025-12-31')

      expect(formatDateDisplay(date2023, 'en', 'short')).toMatch(/2023/)
      expect(formatDateDisplay(date2025, 'en', 'short')).toMatch(/2025/)
    })
  })

  describe('parseDateAndFormat', () => {
    it('should parse string date and format it', () => {
      const result = parseDateAndFormat('2024-06-15', 'en', 'short')
      expect(result).toMatch(/Jun/)
      expect(result).toMatch(/15/)
      expect(result).toMatch(/2024/)
    })

    it('should handle Date object input', () => {
      const date = new Date('2024-06-15')
      const result = parseDateAndFormat(date, 'en', 'short')
      expect(result).toMatch(/Jun/)
      expect(result).toMatch(/2024/)
    })

    it('should return null for invalid date strings', () => {
      expect(parseDateAndFormat('invalid-date', 'en', 'short')).toBe(null)
      expect(parseDateAndFormat('not a date', 'en', 'long')).toBe(null)
    })

    it('should use default format when not specified', () => {
      const result = parseDateAndFormat('2024-06-15', 'en')
      expect(result).toMatch(/Jun/)
      expect(result).toMatch(/2024/)
    })

    it('should handle Japanese locale', () => {
      const result = parseDateAndFormat('2024-06-15', 'ja', 'short')
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/6/)
      expect(result).toMatch(/15/)
    })

    it('should handle all format types', () => {
      const dateStr = '2024-06-15'

      const shortResult = parseDateAndFormat(dateStr, 'en', 'short')
      expect(shortResult).toMatch(/Jun/)

      const longResult = parseDateAndFormat(dateStr, 'en', 'long')
      expect(longResult).toMatch(/June/)

      const monthYearResult = parseDateAndFormat(dateStr, 'en', 'month-year')
      expect(monthYearResult).toMatch(/June/)
      expect(monthYearResult).not.toMatch(/15/)
    })

    it('should handle edge case dates', () => {
      expect(parseDateAndFormat('2024-01-01', 'en', 'short')).toBeTruthy()
      expect(parseDateAndFormat('2024-12-31', 'en', 'short')).toBeTruthy()
      expect(parseDateAndFormat('2024-02-29', 'en', 'short')).toBeTruthy() // Leap year
    })
  })
})
