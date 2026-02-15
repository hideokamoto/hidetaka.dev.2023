import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { CTA_PATTERNS } from './ctaPatterns'
import type { ArticleType, CTAData } from './ctaTypes'

/**
 * CTAパターンデータのユニットテスト
 * Validates: Requirements 4.1, 4.2, 4.3
 */
describe('CTA Patterns Unit Tests', () => {
  describe('Pattern Structure', () => {
    it('should have all required article types', () => {
      const requiredTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
      
      requiredTypes.forEach(type => {
        expect(CTA_PATTERNS).toHaveProperty(type)
      })
    })

    it('should have both ja and en for each pattern', () => {
      const articleTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
      
      articleTypes.forEach(type => {
        expect(CTA_PATTERNS[type]).toHaveProperty('ja')
        expect(CTA_PATTERNS[type]).toHaveProperty('en')
      })
    })
  })

  describe('Required Fields', () => {
    const articleTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
    const languages = ['ja', 'en'] as const

    articleTypes.forEach(type => {
      languages.forEach(lang => {
        it(`should have required fields for ${type} (${lang})`, () => {
          const pattern = CTA_PATTERNS[type][lang]
          
          expect(pattern).toHaveProperty('heading')
          expect(pattern).toHaveProperty('description')
          expect(pattern).toHaveProperty('buttons')
          
          expect(typeof pattern.heading).toBe('string')
          expect(typeof pattern.description).toBe('string')
          expect(Array.isArray(pattern.buttons)).toBe(true)
        })
      })
    })
  })

  describe('Button Constraints', () => {
    const articleTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
    const languages = ['ja', 'en'] as const

    articleTypes.forEach(type => {
      languages.forEach(lang => {
        it(`should have 1-3 buttons for ${type} (${lang})`, () => {
          const pattern = CTA_PATTERNS[type][lang]
          
          expect(pattern.buttons.length).toBeGreaterThanOrEqual(1)
          expect(pattern.buttons.length).toBeLessThanOrEqual(3)
        })

        it(`should have valid button structure for ${type} (${lang})`, () => {
          const pattern = CTA_PATTERNS[type][lang]
          
          pattern.buttons.forEach(button => {
            expect(button).toHaveProperty('text')
            expect(button).toHaveProperty('href')
            expect(typeof button.text).toBe('string')
            expect(typeof button.href).toBe('string')
            expect(button.text.length).toBeGreaterThan(0)
            expect(button.href.length).toBeGreaterThan(0)
            
            if (button.variant) {
              expect(['primary', 'secondary', 'outline']).toContain(button.variant)
            }
          })
        })
      })
    })
  })

  describe('Content Validation', () => {
    it('should have non-empty headings', () => {
      const articleTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
      const languages = ['ja', 'en'] as const

      articleTypes.forEach(type => {
        languages.forEach(lang => {
          const pattern = CTA_PATTERNS[type][lang]
          expect(pattern.heading.trim().length).toBeGreaterThan(0)
        })
      })
    })

    it('should have non-empty descriptions', () => {
      const articleTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']
      const languages = ['ja', 'en'] as const

      articleTypes.forEach(type => {
        languages.forEach(lang => {
          const pattern = CTA_PATTERNS[type][lang]
          expect(pattern.description.trim().length).toBeGreaterThan(0)
        })
      })
    })
  })
})

/**
 * CTAパターンデータのプロパティベーステスト
 * Feature: article-cta-component
 */
describe('CTA Patterns Property Tests', () => {
  /**
   * Property 3: CTAパターンの構造整合性
   * **Validates: Requirements 4.1, 4.2, 4.3**
   * 
   * すべてのCTAパターン（tutorial、essay、tool_announcement、general）は、
   * 見出し（heading）、説明（description）、および1〜3個のボタン（buttons）を含むこと
   */
  it('Property 3: CTA pattern structural integrity', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('tutorial' as ArticleType),
          fc.constant('essay' as ArticleType),
          fc.constant('tool_announcement' as ArticleType),
          fc.constant('general' as ArticleType)
        ),
        fc.oneof(
          fc.constant('ja' as const),
          fc.constant('en' as const)
        ),
        (articleType, lang) => {
          const pattern = CTA_PATTERNS[articleType][lang]
          
          // 必須フィールドの存在確認
          expect(pattern).toHaveProperty('heading')
          expect(pattern).toHaveProperty('description')
          expect(pattern).toHaveProperty('buttons')
          
          // 型の検証
          expect(typeof pattern.heading).toBe('string')
          expect(typeof pattern.description).toBe('string')
          expect(Array.isArray(pattern.buttons)).toBe(true)
          
          // 内容の検証
          expect(pattern.heading.trim().length).toBeGreaterThan(0)
          expect(pattern.description.trim().length).toBeGreaterThan(0)
          
          // ボタン数の制約（1〜3個）
          expect(pattern.buttons.length).toBeGreaterThanOrEqual(1)
          expect(pattern.buttons.length).toBeLessThanOrEqual(3)
          
          // 各ボタンの構造検証
          pattern.buttons.forEach(button => {
            expect(button).toHaveProperty('text')
            expect(button).toHaveProperty('href')
            expect(typeof button.text).toBe('string')
            expect(typeof button.href).toBe('string')
            expect(button.text.trim().length).toBeGreaterThan(0)
            expect(button.href.trim().length).toBeGreaterThan(0)
            
            // variantが存在する場合、有効な値であることを確認
            if (button.variant !== undefined) {
              expect(['primary', 'secondary', 'outline']).toContain(button.variant)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
