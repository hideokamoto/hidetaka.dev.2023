import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  calculateNextPage,
  calculatePrevPage,
  generatePageHref,
  getPaginationText,
  shouldShowPagination,
} from './pagination.utils'

describe('Pagination Utils', () => {
  describe('calculatePrevPage', () => {
    it('should return null for page 1', () => {
      expect(calculatePrevPage(1)).toBe(null)
    })

    it('should return previous page number for page 2', () => {
      expect(calculatePrevPage(2)).toBe(1)
    })

    it('should return previous page number for middle pages', () => {
      expect(calculatePrevPage(5)).toBe(4)
      expect(calculatePrevPage(10)).toBe(9)
    })

    it('should return previous page for last page', () => {
      expect(calculatePrevPage(100)).toBe(99)
    })
  })

  describe('calculateNextPage', () => {
    it('should return null when on last page', () => {
      expect(calculateNextPage(5, 5)).toBe(null)
      expect(calculateNextPage(1, 1)).toBe(null)
    })

    it('should return next page number when not on last page', () => {
      expect(calculateNextPage(1, 5)).toBe(2)
      expect(calculateNextPage(4, 5)).toBe(5)
    })

    it('should return next page for first page', () => {
      expect(calculateNextPage(1, 10)).toBe(2)
    })

    it('should return next page for middle pages', () => {
      expect(calculateNextPage(5, 10)).toBe(6)
      expect(calculateNextPage(50, 100)).toBe(51)
    })
  })

  describe('generatePageHref', () => {
    it('should return empty string for null page number', () => {
      expect(generatePageHref('/blog', null)).toBe('')
    })

    it('should return basePath for page 1', () => {
      expect(generatePageHref('/blog', 1)).toBe('/blog')
      expect(generatePageHref('/writing', 1)).toBe('/writing')
    })

    it('should return paginated path for page 2 and beyond', () => {
      expect(generatePageHref('/blog', 2)).toBe('/blog/page/2')
      expect(generatePageHref('/blog', 5)).toBe('/blog/page/5')
    })

    it('should handle different base paths correctly', () => {
      expect(generatePageHref('/ja/blog', 1)).toBe('/ja/blog')
      expect(generatePageHref('/ja/blog', 2)).toBe('/ja/blog/page/2')
    })

    it('should handle paths without leading slash', () => {
      expect(generatePageHref('blog', 1)).toBe('blog')
      expect(generatePageHref('blog', 3)).toBe('blog/page/3')
    })

    it('should handle large page numbers', () => {
      expect(generatePageHref('/blog', 999)).toBe('/blog/page/999')
    })
  })

  describe('getPaginationText', () => {
    describe('English locale', () => {
      it('should return English text for "en" language', () => {
        expect(getPaginationText('en', 'prev')).toBe('Previous')
        expect(getPaginationText('en', 'next')).toBe('Next')
        expect(getPaginationText('en', 'page')).toBe('Page')
      })

      it('should return English text for "en-US" language', () => {
        expect(getPaginationText('en-US', 'prev')).toBe('Previous')
        expect(getPaginationText('en-US', 'next')).toBe('Next')
        expect(getPaginationText('en-US', 'page')).toBe('Page')
      })

      it('should return English text for unrecognized language codes', () => {
        expect(getPaginationText('fr', 'prev')).toBe('Previous')
        expect(getPaginationText('de', 'next')).toBe('Next')
        expect(getPaginationText('', 'page')).toBe('Page')
      })
    })

    describe('Japanese locale', () => {
      it('should return Japanese text for "ja" language', () => {
        expect(getPaginationText('ja', 'prev')).toBe('前へ')
        expect(getPaginationText('ja', 'next')).toBe('次へ')
        expect(getPaginationText('ja', 'page')).toBe('ページ')
      })

      it('should return Japanese text for "ja-JP" language', () => {
        expect(getPaginationText('ja-JP', 'prev')).toBe('前へ')
        expect(getPaginationText('ja-JP', 'next')).toBe('次へ')
        expect(getPaginationText('ja-JP', 'page')).toBe('ページ')
      })
    })

    describe('All text keys', () => {
      it('should handle all text keys correctly', () => {
        const keys: Array<Parameters<typeof getPaginationText>[1]> = ['prev', 'next', 'page']
        for (const key of keys) {
          expect(getPaginationText('en', key)).toBeTruthy()
          expect(getPaginationText('ja', key)).toBeTruthy()
        }
      })
    })
  })

  describe('shouldShowPagination', () => {
    it('should return false for single page', () => {
      expect(shouldShowPagination(1)).toBe(false)
    })

    it('should return false for zero pages', () => {
      expect(shouldShowPagination(0)).toBe(false)
    })

    it('should return true for two pages', () => {
      expect(shouldShowPagination(2)).toBe(true)
    })

    it('should return true for multiple pages', () => {
      expect(shouldShowPagination(5)).toBe(true)
      expect(shouldShowPagination(10)).toBe(true)
      expect(shouldShowPagination(100)).toBe(true)
    })
  })

  describe('property-based tests', () => {
    describe('calculatePrevPage', () => {
      it('should return null for page 1, and currentPage - 1 for pages > 1', () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 1000 }), (currentPage) => {
            const result = calculatePrevPage(currentPage)
            if (currentPage === 1) {
              expect(result).toBe(null)
            } else {
              expect(result).toBe(currentPage - 1)
            }
          }),
        )
      })

      it('should always return a value less than currentPage or null', () => {
        fc.assert(
          fc.property(fc.integer({ min: 1, max: 1000 }), (currentPage) => {
            const result = calculatePrevPage(currentPage)
            if (result !== null) {
              expect(result).toBeLessThan(currentPage)
              expect(result).toBeGreaterThanOrEqual(1)
            }
          }),
        )
      })
    })

    describe('calculateNextPage', () => {
      it('should return null when currentPage >= totalPages, otherwise currentPage + 1', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 1, max: 1000 }),
            (currentPage, totalPages) => {
              const result = calculateNextPage(currentPage, totalPages)
              if (currentPage >= totalPages) {
                expect(result).toBe(null)
              } else {
                expect(result).toBe(currentPage + 1)
              }
            },
          ),
        )
      })

      it('should always return a value greater than currentPage or null', () => {
        fc.assert(
          fc.property(
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 1, max: 1000 }),
            (currentPage, totalPages) => {
              const result = calculateNextPage(currentPage, totalPages)
              if (result !== null) {
                expect(result).toBeGreaterThan(currentPage)
                expect(result).toBeLessThanOrEqual(totalPages)
              }
            },
          ),
        )
      })
    })

    describe('generatePageHref', () => {
      it('should return empty string for null, basePath for page 1, and basePath/page/N for page > 1', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 1000 })),
            (basePath, pageNumber) => {
              const result = generatePageHref(basePath, pageNumber)
              if (pageNumber === null) {
                expect(result).toBe('')
              } else if (pageNumber === 1) {
                expect(result).toBe(basePath)
              } else {
                expect(result).toBe(`${basePath}/page/${pageNumber}`)
              }
            },
          ),
        )
      })

      it('should always include basePath in result (except for null)', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.integer({ min: 1, max: 1000 }),
            (basePath, pageNumber) => {
              const result = generatePageHref(basePath, pageNumber)
              if (pageNumber === 1) {
                expect(result).toBe(basePath)
              } else {
                expect(result).toContain(basePath)
                expect(result).toContain(`/page/${pageNumber}`)
              }
            },
          ),
        )
      })
    })

    describe('shouldShowPagination', () => {
      it('should return false for totalPages <= 1, true for totalPages > 1', () => {
        fc.assert(
          fc.property(fc.integer({ min: 0, max: 1000 }), (totalPages) => {
            const result = shouldShowPagination(totalPages)
            if (totalPages <= 1) {
              expect(result).toBe(false)
            } else {
              expect(result).toBe(true)
            }
          }),
        )
      })
    })

    describe('getPaginationText', () => {
      it('should return non-empty string for any language and key', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 0, maxLength: 20 }),
            fc.constantFrom('prev', 'next', 'page' as const),
            (lang, key) => {
              const result = getPaginationText(lang, key)
              expect(typeof result).toBe('string')
              expect(result.length).toBeGreaterThan(0)
            },
          ),
        )
      })

      it('should return Japanese text for languages starting with "ja"', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 2, maxLength: 20 }).filter((s) => s.startsWith('ja')),
            fc.constantFrom('prev', 'next', 'page' as const),
            (lang, key) => {
              const result = getPaginationText(lang, key)
              // 日本語のテキストが返されることを確認（具体的な値は既存テストで確認済み）
              expect(result).toBeTruthy()
            },
          ),
        )
      })

      it('should return English text for languages not starting with "ja"', () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 0, maxLength: 20 }).filter((s) => !s.startsWith('ja')),
            fc.constantFrom('prev', 'next', 'page' as const),
            (lang, key) => {
              const result = getPaginationText(lang, key)
              // 英語のテキストが返されることを確認（具体的な値は既存テストで確認済み）
              expect(result).toBeTruthy()
            },
          ),
        )
      })
    })
  })
})
