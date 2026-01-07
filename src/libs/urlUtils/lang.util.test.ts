import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { changeLanguageURL, getLanguageFromURL, getPathnameWithLangType } from './lang.util'

describe('getLanguageFromURL', () => {
  it('should extract ja from /ja/ URL', () => {
    expect(getLanguageFromURL('/ja/about')).toBe('ja')
  })

  it('should extract ja from /ja path', () => {
    expect(getLanguageFromURL('/ja')).toBe('ja')
  })

  it('should return en for root path', () => {
    expect(getLanguageFromURL('/')).toBe('en')
  })

  it('should return en for English paths without locale code', () => {
    expect(getLanguageFromURL('/about')).toBe('en')
  })

  it('should handle paths with multiple segments', () => {
    expect(getLanguageFromURL('/ja/blog/post-1')).toBe('ja')
  })

  it('should handle uppercase /JA/ paths', () => {
    expect(getLanguageFromURL('/JA/about')).toBe('ja')
  })

  it('should handle mixed case paths', () => {
    expect(getLanguageFromURL('/Ja/blog')).toBe('ja')
  })
})

describe('changeLanguageURL', () => {
  describe('converting to Japanese (ja)', () => {
    it('should add /ja prefix to English URL', () => {
      expect(changeLanguageURL('/about', 'ja')).toBe('/ja/about')
    })

    it('should add /ja prefix to root path', () => {
      expect(changeLanguageURL('/', 'ja')).toBe('/ja/')
    })

    it('should handle multi-segment paths', () => {
      expect(changeLanguageURL('/blog/post-1', 'ja')).toBe('/ja/blog/post-1')
    })
  })

  describe('converting to English (en)', () => {
    it('should remove /ja prefix', () => {
      expect(changeLanguageURL('/ja/about', 'en')).toBe('/about')
    })

    it('should remove /ja prefix from multi-segment path', () => {
      expect(changeLanguageURL('/ja/blog/post-1', 'en')).toBe('/blog/post-1')
    })

    it('should handle root path correctly', () => {
      expect(changeLanguageURL('/ja/', 'en')).toBe('/')
    })
  })

  describe('same language (no change)', () => {
    it('should not change English URL when already English', () => {
      expect(changeLanguageURL('/about', 'en')).toBe('/about')
    })

    it('should not change Japanese URL when already Japanese', () => {
      expect(changeLanguageURL('/ja/about', 'ja')).toBe('/ja/about')
    })
  })

  describe('edge cases', () => {
    it('should handle root path to Japanese', () => {
      expect(changeLanguageURL('/', 'ja')).toBe('/ja/')
    })

    it('should handle Japanese root path to English', () => {
      expect(changeLanguageURL('/ja/', 'en')).toBe('/')
    })

    it('should handle uppercase /JA/ prefix removal', () => {
      expect(changeLanguageURL('/JA/about', 'en')).toBe('/about')
    })

    it('should handle mixed case /Ja/ prefix removal', () => {
      expect(changeLanguageURL('/Ja/blog', 'en')).toBe('/blog')
    })
  })

  describe('input validation', () => {
    it('should throw error if pathname does not start with /', () => {
      expect(() => changeLanguageURL('about', 'ja')).toThrow('pathname must start with /')
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
    it('should return path with /ja/ prefix for "ja"', () => {
      expect(getPathnameWithLangType('about', 'ja')).toBe('/ja/about')
    })

    it('should return path with /ja/ prefix for "ja-JP"', () => {
      expect(getPathnameWithLangType('blog', 'ja-JP')).toBe('/ja/blog')
    })

    it('should handle any string containing "ja"', () => {
      expect(getPathnameWithLangType('work', 'japanese')).toBe('/ja/work')
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

  describe('case-insensitive language codes', () => {
    it('should handle uppercase EN language code', () => {
      expect(getPathnameWithLangType('about', 'EN')).toBe('/about')
    })

    it('should handle uppercase JA language code', () => {
      expect(getPathnameWithLangType('about', 'JA')).toBe('/ja/about')
    })

    it('should handle mixed case En language code', () => {
      expect(getPathnameWithLangType('blog', 'En')).toBe('/blog')
    })

    it('should handle mixed case Ja language code', () => {
      expect(getPathnameWithLangType('blog', 'Ja')).toBe('/ja/blog')
    })

    it('should handle uppercase EN-US language code', () => {
      expect(getPathnameWithLangType('work', 'EN-US')).toBe('/work')
    })

    it('should handle uppercase JA-JP language code', () => {
      expect(getPathnameWithLangType('work', 'JA-JP')).toBe('/ja/work')
    })
  })

  describe('property-based tests', () => {
    describe('getLanguageFromURL', () => {
      it('should return "en" when pathname does not start with /ja/', () => {
        fc.assert(
          fc.property(
            fc
              .string({ minLength: 0, maxLength: 100 })
              .filter((s) => !s.startsWith('/ja/') && s !== '/ja'),
            (pathname) => {
              const result = getLanguageFromURL(pathname)
              expect(result).toBe('en')
            },
          ),
        )
      })

      it('should return "ja" when pathname starts with /ja/', () => {
        fc.assert(
          fc.property(fc.string({ minLength: 1, maxLength: 100 }), (path) => {
            const pathname = `/ja/${path}`
            const result = getLanguageFromURL(pathname)
            expect(result).toBe('ja')
          }),
        )
      })
    })

    describe('changeLanguageURL', () => {
      it('should return a string for any pathname and target language', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.startsWith('/')),
            fc.constantFrom('en', 'ja' as const),
            (pathname, targetLang) => {
              const result = changeLanguageURL(pathname, targetLang)
              expect(typeof result).toBe('string')
            },
          ),
        )
      })

      it('should be idempotent when converting to the same language', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.startsWith('/')),
            fc.constantFrom('en', 'ja' as const),
            (pathname, targetLang) => {
              const result1 = changeLanguageURL(pathname, targetLang)
              const result2 = changeLanguageURL(result1, targetLang)
              expect(result1).toBe(result2)
            },
          ),
        )
      })

      it('should preserve path structure when changing language', () => {
        fc.assert(
          fc.property(
            fc
              .string({ minLength: 1, maxLength: 100 })
              .filter((s) => s.startsWith('/') && !s.startsWith('/ja/')),
            fc.constantFrom('en', 'ja' as const),
            (pathname, targetLang) => {
              const result = changeLanguageURL(pathname, targetLang)
              expect(result).toMatch(/^\//)
              expect(result.length).toBeGreaterThan(0)
            },
          ),
        )
      })
    })

    describe('getPathnameWithLangType', () => {
      it('should return a string starting with / for any input', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 0, maxLength: 100 }),
            fc.string({ minLength: 0, maxLength: 20 }),
            (targetPath, lang) => {
              const result = getPathnameWithLangType(targetPath, lang)
              expect(typeof result).toBe('string')
              expect(result).toMatch(/^\//)
            },
          ),
        )
      })

      describe('common language codes', () => {
        it('should return path with /ja/ prefix for common Japanese language codes', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.constantFrom('ja', 'ja-JP', 'japanese', 'ja_JP'),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toMatch(/^\/ja\//)
              },
            ),
          )
        })

        it('should return path without language prefix for common English language codes', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.constantFrom('en', 'en-US', 'en-GB', 'en-CA', 'english'),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toBe(`/${targetPath}`)
              },
            ),
          )
        })

        it('should return path with language code prefix for other common languages', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.constantFrom('fr', 'de', 'es', 'it', 'pt', 'zh', 'ko', 'ru'),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toBe(`/${lang}/${targetPath}`)
              },
            ),
          )
        })
      })

      describe('boundary value tests', () => {
        it('should handle edge cases: empty string, single character, long strings', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.oneof(
                fc.constant(''),
                fc.string({ minLength: 1, maxLength: 1 }),
                fc.string({ minLength: 50, maxLength: 100 }),
              ),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toMatch(/^\//)
                // Verify the result matches expected patterns
                if (/en/i.test(lang) && !/ja/i.test(lang)) {
                  expect(result).toBe(`/${targetPath}`)
                } else if (/ja/i.test(lang)) {
                  expect(result).toBe(`/ja/${targetPath}`)
                } else {
                  expect(result).toBe(`/${lang}/${targetPath}`)
                }
              },
            ),
          )
        })

        it('should handle "ja" prefix with various suffixes (boundary cases)', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.oneof(
                fc.constant('ja'),
                fc
                  .tuple(
                    fc.constant('ja'),
                    fc
                      .string({ minLength: 1, maxLength: 1 })
                      .filter((c) => c.toLowerCase() !== 'e'),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(
                    fc.constant('ja'),
                    fc.string({ minLength: 10, maxLength: 20 }).filter((s) => !/en/i.test(s)),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
              ),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toMatch(/^\/ja\//)
              },
            ),
          )
        })
      })

      describe('special characters and various string patterns', () => {
        it('should handle special characters and various string patterns', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.oneof(
                fc
                  .tuple(
                    fc.constant('ja'),
                    fc.string({ minLength: 0, maxLength: 10 }).filter((s) => !/en/i.test(s)),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(fc.constant('en'), fc.string({ minLength: 0, maxLength: 10 }))
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(
                    fc
                      .string({ minLength: 1, maxLength: 1 })
                      .filter((c) => c.toLowerCase() !== 'j' && c.toLowerCase() !== 'e'),
                    fc.string({ minLength: 0, maxLength: 10 }),
                  )
                  .map(([first, rest]) => first + rest),
              ),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                if (/ja/i.test(lang) && !/en/i.test(lang)) {
                  expect(result).toMatch(/^\/ja\//)
                } else if (/en/i.test(lang)) {
                  expect(result).toBe(`/${targetPath}`)
                } else {
                  expect(result).toBe(`/${lang}/${targetPath}`)
                }
              },
            ),
          )
        })
      })
    })
  })
})
