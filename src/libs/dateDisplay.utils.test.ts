import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  formatDateDisplay,
  getDateFormatOptions,
  getDateLocale,
  isValidDate,
  parseDate,
  parseDateAndFormat,
  parseDateSafely,
  parseDateWithFallback,
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

  describe('property-based tests', () => {
    describe('parseDate', () => {
      it('should return Date object when input is Date', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
            (date) => {
              const result = parseDate(date)
              expect(result).toBe(date)
              expect(result).toBeInstanceOf(Date)
            },
          ),
        )
      })

      it('should return Date object when input is string', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }).map((date) => {
              const year = date.getUTCFullYear()
              const month = String(date.getUTCMonth() + 1).padStart(2, '0')
              const day = String(date.getUTCDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }),
            (dateStr) => {
              const result = parseDate(dateStr)
              expect(result).toBeInstanceOf(Date)
            },
          ),
        )
      })
    })

    describe('isValidDate', () => {
      it('should return true for valid dates', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }).filter((date) => {
              return !Number.isNaN(date.getTime())
            }),
            (date) => {
              expect(isValidDate(date)).toBe(true)
            },
          ),
        )
      })

      it('should return false for invalid dates', () => {
        fc.assert(
          fc.property(
            fc.string().filter((s) => {
              const date = new Date(s)
              return Number.isNaN(date.getTime())
            }),
            (invalidStr) => {
              const invalidDate = new Date(invalidStr)
              expect(isValidDate(invalidDate)).toBe(false)
            },
          ),
        )
      })
    })

    describe('getDateLocale', () => {
      describe('common language codes', () => {
        it('should return "ja-JP" for common Japanese language codes', () => {
          fc.assert(
            fc.property(
              fc.constantFrom('ja', 'ja-JP', 'japanese', 'ja_JP', 'ja-JP-u-ca-japanese'),
              (lang) => {
                expect(getDateLocale(lang)).toBe('ja-JP')
              },
            ),
          )
        })

        it('should return "en-US" for common non-Japanese language codes', () => {
          fc.assert(
            fc.property(
              fc.constantFrom(
                'en',
                'en-US',
                'en-GB',
                'en-CA',
                'fr',
                'de',
                'es',
                'it',
                'pt',
                'zh',
                'ko',
              ),
              (lang) => {
                expect(getDateLocale(lang)).toBe('en-US')
              },
            ),
          )
        })
      })

      describe('boundary value tests', () => {
        it('should handle edge cases: empty string, single character, long strings', () => {
          fc.assert(
            fc.property(
              fc.oneof(
                fc.constant(''),
                fc.string({ minLength: 1, maxLength: 1 }),
                fc.string({ minLength: 50, maxLength: 100 }).filter((s) => !s.startsWith('ja')),
              ),
              (lang) => {
                const result = getDateLocale(lang)
                if (lang.startsWith('ja')) {
                  expect(result).toBe('ja-JP')
                } else {
                  expect(result).toBe('en-US')
                }
              },
            ),
          )
        })

        it('should handle "ja" prefix with various suffixes (boundary cases)', () => {
          fc.assert(
            fc.property(
              fc.oneof(
                fc.constant('ja'),
                fc
                  .tuple(fc.constant('ja'), fc.string({ minLength: 1, maxLength: 1 }))
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(fc.constant('ja'), fc.string({ minLength: 10, maxLength: 20 }))
                  .map(([prefix, suffix]) => prefix + suffix),
              ),
              (lang) => {
                expect(getDateLocale(lang)).toBe('ja-JP')
              },
            ),
          )
        })
      })

      describe('special characters and various string patterns', () => {
        it('should handle special characters in language codes', () => {
          fc.assert(
            fc.property(
              fc.oneof(
                fc
                  .tuple(fc.constant('ja'), fc.string({ minLength: 0, maxLength: 10 }))
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(
                    fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c !== 'j'),
                    fc.string({ minLength: 0, maxLength: 10 }),
                  )
                  .map(([first, rest]) => first + rest),
              ),
              (lang) => {
                const result = getDateLocale(lang)
                if (lang.startsWith('ja')) {
                  expect(result).toBe('ja-JP')
                } else {
                  expect(result).toBe('en-US')
                }
              },
            ),
          )
        })
      })
    })

    describe('formatDateDisplay', () => {
      it('should return a non-empty string for any valid date', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (date, lang, format) => {
              const result = formatDateDisplay(date, lang, format)
              expect(typeof result).toBe('string')
              expect(result.length).toBeGreaterThan(0)
            },
          ),
        )
      })

      it('should include year in output for all formats', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }).filter((date) => {
              return !Number.isNaN(date.getTime())
            }),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (date, lang, format) => {
              const result = formatDateDisplay(date, lang, format)
              // month-year format uses UTC timezone, others use local timezone
              const year =
                format === 'month-year'
                  ? date.getUTCFullYear().toString()
                  : date.getFullYear().toString()
              expect(result).toContain(year)
            },
          ),
        )
      })

      it('should be consistent for same date, lang, and format', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (date, lang, format) => {
              const result1 = formatDateDisplay(date, lang, format)
              const result2 = formatDateDisplay(date, lang, format)
              expect(result1).toBe(result2)
            },
          ),
        )
      })
    })

    describe('parseDateAndFormat', () => {
      it('should return string or null for any input', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
              fc.string({ minLength: 0, maxLength: 100 }),
            ),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (date, lang, format) => {
              const result = parseDateAndFormat(date, lang, format)
              expect(result === null || typeof result === 'string').toBe(true)
            },
          ),
        )
      })

      it('should return null for invalid date strings', () => {
        fc.assert(
          fc.property(
            fc.string().filter((s) => {
              const date = new Date(s)
              return Number.isNaN(date.getTime())
            }),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (invalidStr, lang, format) => {
              const result = parseDateAndFormat(invalidStr, lang, format)
              expect(result).toBe(null)
            },
          ),
        )
      })

      it('should return non-null string for valid dates', () => {
        fc.assert(
          fc.property(
            fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('short', 'long', 'month-year' as const),
            (date, lang, format) => {
              // 有効な日付であることを確認
              if (Number.isNaN(date.getTime())) {
                return
              }
              const result = parseDateAndFormat(date, lang, format)
              expect(result).not.toBe(null)
              if (result !== null) {
                expect(typeof result).toBe('string')
                expect(result.length).toBeGreaterThan(0)
              }
            },
          ),
        )
      })
    })
  })

  describe('parseDateSafely', () => {
    it('should return Date object for valid date strings', () => {
      const result = parseDateSafely('2024-06-15')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(5) // June is month 5 (0-indexed)
      expect(result?.getDate()).toBe(15)
    })

    it('should return null for invalid date strings', () => {
      expect(parseDateSafely('invalid-date')).toBe(null)
      expect(parseDateSafely('not a date')).toBe(null)
      expect(parseDateSafely('2024-13-45')).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(parseDateSafely(undefined)).toBe(null)
    })

    it('should return null for empty string', () => {
      expect(parseDateSafely('')).toBe(null)
    })

    it('should handle ISO 8601 date strings', () => {
      const result = parseDateSafely('2024-06-15T10:30:00Z')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should handle RFC 2822 date strings (from RSS feeds)', () => {
      const result = parseDateSafely('Wed, 15 Jun 2024 10:30:00 GMT')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should accept context for logging', () => {
      // Should not throw error even with context
      const result = parseDateSafely('invalid-date', {
        articleTitle: 'Test Article',
        source: 'RSS',
      })
      expect(result).toBe(null)
    })

    it('should handle future dates (with warning)', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureISOString = futureDate.toISOString()

      const result = parseDateSafely(futureISOString)
      // Future dates should still be returned (not null)
      expect(result).toBeInstanceOf(Date)
    })

    it('should handle edge case dates', () => {
      expect(parseDateSafely('2024-01-01')).toBeInstanceOf(Date)
      expect(parseDateSafely('2024-12-31')).toBeInstanceOf(Date)
      expect(parseDateSafely('2024-02-29')).toBeInstanceOf(Date) // Leap year
    })
  })

  describe('parseDateWithFallback', () => {
    const fallbackDate = new Date('2020-01-01')

    it('should return parsed date for valid input', () => {
      const result = parseDateWithFallback('2024-06-15', fallbackDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
    })

    it('should return fallback date for invalid input', () => {
      const result = parseDateWithFallback('invalid-date', fallbackDate)
      expect(result).toBe(fallbackDate)
      expect(result.getFullYear()).toBe(2020)
    })

    it('should return fallback date for undefined input', () => {
      const result = parseDateWithFallback(undefined, fallbackDate)
      expect(result).toBe(fallbackDate)
    })

    it('should return fallback date for empty string', () => {
      const result = parseDateWithFallback('', fallbackDate)
      expect(result).toBe(fallbackDate)
    })

    it('should accept context for logging', () => {
      const result = parseDateWithFallback('invalid-date', fallbackDate, {
        articleTitle: 'Test Article',
      })
      expect(result).toBe(fallbackDate)
    })

    it('should handle ISO 8601 date strings', () => {
      const result = parseDateWithFallback('2024-06-15T10:30:00Z', fallbackDate)
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
    })

    it('should never return null (always returns fallback)', () => {
      const result1 = parseDateWithFallback(undefined, fallbackDate)
      const result2 = parseDateWithFallback('invalid', fallbackDate)
      const result3 = parseDateWithFallback('', fallbackDate)

      expect(result1).not.toBe(null)
      expect(result2).not.toBe(null)
      expect(result3).not.toBe(null)
    })
  })
})
