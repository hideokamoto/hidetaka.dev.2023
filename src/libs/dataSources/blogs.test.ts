import { describe, expect, it } from 'vitest'
import { isJapanese } from '@/libs/urlUtils/lang.util'

describe('isJapanese', () => {
  it.each([
    { locale: 'ja', expected: true },
    { locale: 'ja-JP', expected: true },
    { locale: 'ja-jp', expected: true },
    { locale: 'en', expected: false },
    { locale: 'en-US', expected: false },
    { locale: undefined, expected: false },
    { locale: '', expected: false },
    { locale: 'fr', expected: false },
    { locale: 'de', expected: false },
    { locale: 'es', expected: false },
  ])('should return $expected for locale "$locale"', ({ locale, expected }) => {
    expect(isJapanese(locale)).toBe(expected)
  })
})
