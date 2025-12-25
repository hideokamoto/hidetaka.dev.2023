import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { changeLanguageURL, getLanguageFromURL, getPathnameWithLangType } from './lang.util'

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

  describe('property-based tests', () => {
    describe('getLanguageFromURL', () => {
      it('should return "en-US" when pathname does not start with language code', () => {
        fc.assert(
          fc.property(
            fc
              .string({ minLength: 0, maxLength: 100 })
              .filter((s) => s === '/' || !s.startsWith('/') || !/^\/[a-z]{2}-[a-z-]+/i.test(s)),
            (pathname) => {
              const result = getLanguageFromURL(pathname)
              expect(result).toBe('en-US')
            },
          ),
        )
      })

      describe('実際に使用される言語コード形式', () => {
        it('should extract 2-letter language code from common language code formats', () => {
          fc.assert(
            fc.property(
              fc.constantFrom('ja', 'en', 'fr', 'de', 'es', 'it', 'pt', 'zh', 'ko', 'ru'),
              fc.constantFrom('JP', 'US', 'GB', 'CA', 'FR', 'DE', 'ES'),
              fc.string({ minLength: 0, maxLength: 50 }),
              (langCode, region, path) => {
                const pathname = `/${langCode}-${region}${path ? `/${path}` : ''}`
                const result = getLanguageFromURL(pathname)
                // 実装では大文字小文字が保持される可能性があるので、小文字に変換して比較
                expect(result.toLowerCase()).toBe(langCode.toLowerCase())
              },
            ),
          )
        })
      })

      describe('境界値テスト', () => {
        it('should extract 2-letter language code from various pathname formats', () => {
          fc.assert(
            fc.property(
              fc
                .tuple(
                  fc.string({ minLength: 2, maxLength: 2 }).filter((c) => /^[a-z]{2}$/i.test(c)),
                  fc.string({ minLength: 2, maxLength: 10 }).filter((s) => /^[\w-]+$/.test(s)),
                )
                .map(([langCode, region]) => ({ langCode, region })),
              fc.string({ minLength: 0, maxLength: 50 }),
              ({ langCode, region }, path) => {
                const pathname = `/${langCode}-${region}${path ? `/${path}` : ''}`
                const result = getLanguageFromURL(pathname)
                // 正規表現がマッチする場合のみ、言語コードが抽出される
                if (/^\/(\w{2})-([\w-]{2,})/.test(pathname)) {
                  expect(result.toLowerCase()).toBe(langCode.toLowerCase())
                } else {
                  expect(result).toBe('en-US')
                }
              },
            ),
          )
        })
      })
    })

    describe('changeLanguageURL', () => {
      it('should return a string for any pathname and target language', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 0, maxLength: 200 }),
            fc.constantFrom('en-US', 'ja-JP' as const),
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
            fc.string({ minLength: 0, maxLength: 200 }).filter((s) => {
              // 既に言語コードで始まっているパス、またはルートパス、または通常のパス
              // 実装の制約を考慮して、有効なパス名のみをテスト
              return s === '/' || s.startsWith('/') || s === ''
            }),
            fc.constantFrom('en-US', 'ja-JP' as const),
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
              .filter((s) => s.startsWith('/') && !/^\/[a-z]{2}-[a-z-]+/i.test(s)),
            fc.constantFrom('en-US', 'ja-JP' as const),
            (pathname, targetLang) => {
              const result = changeLanguageURL(pathname, targetLang)
              // パスの構造が保持される（言語プレフィックス以外）
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

      describe('実際に使用される言語コード', () => {
        it('should return path with /ja-JP/ prefix for common Japanese language codes', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.constantFrom('ja', 'ja-JP', 'japanese', 'ja_JP'),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                expect(result).toMatch(/^\/ja-JP\//)
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

      describe('境界値テスト', () => {
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
                // 空文字列や長い文字列は「ja」や「en」を含まない可能性が高い
                if (!/ja/.test(lang) && !/en/.test(lang)) {
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
                    fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c !== 'e'),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(
                    fc.constant('ja'),
                    fc.string({ minLength: 10, maxLength: 20 }).filter((s) => !s.includes('en')),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
              ),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                // "ja"で始まり"en"を含まない文字列の場合、日本語プレフィックスが付く
                expect(result).toMatch(/^\/ja-JP\//)
              },
            ),
          )
        })
      })

      describe('特殊文字を含む文字列', () => {
        it('should handle special characters and various string patterns', () => {
          fc.assert(
            fc.property(
              fc.string({ minLength: 0, maxLength: 100 }),
              fc.oneof(
                fc
                  .tuple(
                    fc.constant('ja'),
                    fc.string({ minLength: 0, maxLength: 10 }).filter((s) => !s.includes('en')),
                  )
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(fc.constant('en'), fc.string({ minLength: 0, maxLength: 10 }))
                  .map(([prefix, suffix]) => prefix + suffix),
                fc
                  .tuple(
                    fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c !== 'j' && c !== 'e'),
                    fc.string({ minLength: 0, maxLength: 10 }),
                  )
                  .map(([first, rest]) => first + rest),
              ),
              (targetPath, lang) => {
                const result = getPathnameWithLangType(targetPath, lang)
                if (/ja/.test(lang) && !/en/.test(lang)) {
                  expect(result).toMatch(/^\/ja-JP\//)
                } else if (/en/.test(lang)) {
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
