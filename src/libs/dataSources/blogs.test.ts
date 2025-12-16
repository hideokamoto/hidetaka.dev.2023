import { describe, expect, it } from 'vitest'
import { isJapanese } from './blogs'

describe('isJapanese', () => {
  it('should return true for "ja" locale', () => {
    expect(isJapanese('ja')).toBe(true)
  })

  it('should return true for "ja-JP" locale', () => {
    expect(isJapanese('ja-JP')).toBe(true)
  })

  it('should return true for "ja-jp" locale (lowercase)', () => {
    expect(isJapanese('ja-jp')).toBe(true)
  })

  it('should return false for "en" locale', () => {
    expect(isJapanese('en')).toBe(false)
  })

  it('should return false for "en-US" locale', () => {
    expect(isJapanese('en-US')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isJapanese(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isJapanese('')).toBe(false)
  })

  it('should return false for other locales', () => {
    expect(isJapanese('fr')).toBe(false)
    expect(isJapanese('de')).toBe(false)
    expect(isJapanese('es')).toBe(false)
  })
})
