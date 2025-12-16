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
        const keys: Array<'prev' | 'next' | 'page'> = ['prev', 'next', 'page']
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
})
