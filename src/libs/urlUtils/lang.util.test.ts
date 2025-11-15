import { describe, it, expect } from 'vitest'
import { getLanguageFromURL, changeLanguageURL, getPathnameWithLangType } from './lang.util'

describe('getLanguageFromURL', () => {
  it('should extract ja from ja-JP URL', () => {
    expect(getLanguageFromURL('/ja-JP/about')).toBe('ja')
  })

  it('should extract ja from ja-jp URL (lowercase)', () => {
    expect(getLanguageFromURL('/ja-jp/blog')).toBe('ja')
  })

  it('should extract en from en-US URL', () => {
    expect(getLanguageFromURL('/en-US/about')).toBe('en')
  })

  it('should return en-US for root path', () => {
    expect(getLanguageFromURL('/')).toBe('en-US')
  })

  it('should return en-US for English paths without locale code', () => {
    expect(getLanguageFromURL('/about')).toBe('en-US')
  })

  it('should handle paths with multiple segments', () => {
    expect(getLanguageFromURL('/ja-JP/blog/post-1')).toBe('ja')
  })
})

describe('changeLanguageURL', () => {
  describe('converting to Japanese (ja-JP)', () => {
    it('should add ja-JP prefix to English URL', () => {
      expect(changeLanguageURL('/about', 'ja-JP')).toBe('/ja-JP/about')
    })

    it('should add ja-JP prefix to root path', () => {
      expect(changeLanguageURL('/', 'ja-JP')).toBe('/ja-JP/')
    })

    it('should handle multi-segment paths', () => {
      expect(changeLanguageURL('/blog/post-1', 'ja-JP')).toBe('/ja-JP/blog/post-1')
    })
  })

  describe('converting to English (en-US)', () => {
    it('should remove ja-JP prefix', () => {
      expect(changeLanguageURL('/ja-JP/about', 'en-US')).toBe('/about')
    })

    it('should remove ja-JP prefix from multi-segment path', () => {
      expect(changeLanguageURL('/ja-JP/blog/post-1', 'en-US')).toBe('/blog/post-1')
    })

    it('should remove ja-jp prefix (lowercase)', () => {
      expect(changeLanguageURL('/ja-jp/about', 'en-US')).toBe('/about')
    })
  })

  describe('same language (no change)', () => {
    it('should not change English URL when already English', () => {
      expect(changeLanguageURL('/about', 'en-US')).toBe('/about')
    })

    it('should not change Japanese URL when already Japanese', () => {
      expect(changeLanguageURL('/ja-JP/about', 'ja-JP')).toBe('/ja-JP/about')
    })
  })

  describe('edge cases', () => {
    it('should handle root path to Japanese', () => {
      expect(changeLanguageURL('/', 'ja-JP')).toBe('/ja-JP/')
    })

    it('should handle Japanese root path to English', () => {
      expect(changeLanguageURL('/ja-JP/', 'en-US')).toBe('/')
    })
  })
})

describe('getPathnameWithLangType', () => {
  describe('English language', () => {
    it('should return path with leading slash for "en"', () => {
      expect(getPathnameWithLangType('about', 'en')).toBe('/about')
    })

    it('should return path with leading slash for "en-US"', () => {
      expect(getPathnameWithLangType('blog', 'en-US')).toBe('/blog')
    })

    it('should handle any string containing "en"', () => {
      expect(getPathnameWithLangType('work', 'english')).toBe('/work')
    })
  })

  describe('Japanese language', () => {
    it('should return path with /ja-JP/ prefix for "ja"', () => {
      expect(getPathnameWithLangType('about', 'ja')).toBe('/ja-JP/about')
    })

    it('should return path with /ja-JP/ prefix for "ja-JP"', () => {
      expect(getPathnameWithLangType('blog', 'ja-JP')).toBe('/ja-JP/blog')
    })

    it('should handle any string containing "ja"', () => {
      expect(getPathnameWithLangType('work', 'japanese')).toBe('/ja-JP/work')
    })
  })

  describe('other languages', () => {
    it('should add language code prefix for other languages', () => {
      expect(getPathnameWithLangType('about', 'fr')).toBe('/fr/about')
    })

    it('should add language code prefix for es', () => {
      expect(getPathnameWithLangType('blog', 'es')).toBe('/es/blog')
    })
  })
})
