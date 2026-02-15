/**
 * CTA バリデーション関数のテスト
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { ArticleType, CTAData } from './ctaTypes'
import { isValidCTAData, normalizeArticleType, normalizeLang } from './ctaValidation'

describe('ctaValidation', () => {
  describe('isValidCTAData', () => {
    describe('Unit Tests', () => {
      it('should return true for valid CTA data', () => {
        const validData: CTAData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: 'Button 1', href: '/path1', variant: 'primary' }],
        }
        expect(isValidCTAData(validData)).toBe(true)
      })

      it('should return true for valid CTA data with multiple buttons', () => {
        const validData: CTAData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [
            { text: 'Button 1', href: '/path1', variant: 'primary' },
            { text: 'Button 2', href: '/path2', variant: 'secondary' },
            { text: 'Button 3', href: '/path3', variant: 'outline' },
          ],
        }
        expect(isValidCTAData(validData)).toBe(true)
      })

      it('should return true for valid CTA data without variant', () => {
        const validData: CTAData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: 'Button 1', href: '/path1' }],
        }
        expect(isValidCTAData(validData)).toBe(true)
      })

      it('should return false for null', () => {
        expect(isValidCTAData(null)).toBe(false)
      })

      it('should return false for undefined', () => {
        expect(isValidCTAData(undefined)).toBe(false)
      })

      it('should return false for non-object', () => {
        expect(isValidCTAData('string')).toBe(false)
        expect(isValidCTAData(123)).toBe(false)
        expect(isValidCTAData(true)).toBe(false)
      })

      it('should return false for missing heading', () => {
        const invalidData = {
          description: 'Test Description',
          buttons: [{ text: 'Button', href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for missing description', () => {
        const invalidData = {
          heading: 'Test Heading',
          buttons: [{ text: 'Button', href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for missing buttons', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for empty buttons array', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for more than 3 buttons', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [
            { text: 'Button 1', href: '/path1' },
            { text: 'Button 2', href: '/path2' },
            { text: 'Button 3', href: '/path3' },
            { text: 'Button 4', href: '/path4' },
          ],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for button without text', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for button without href', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: 'Button' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for button with invalid variant', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: 'Button', href: '/path', variant: 'invalid' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for whitespace-only heading', () => {
        const invalidData = {
          heading: '   ',
          description: 'Test Description',
          buttons: [{ text: 'Button', href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for whitespace-only description', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: '   ',
          buttons: [{ text: 'Button', href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for whitespace-only button text', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: '   ', href: '/path' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })

      it('should return false for whitespace-only button href', () => {
        const invalidData = {
          heading: 'Test Heading',
          description: 'Test Description',
          buttons: [{ text: 'Button', href: '   ' }],
        }
        expect(isValidCTAData(invalidData)).toBe(false)
      })
    })
  })

  describe('normalizeArticleType', () => {
    describe('Unit Tests', () => {
      it('should return "tutorial" for valid tutorial type', () => {
        expect(normalizeArticleType('tutorial')).toBe('tutorial')
      })

      it('should return "essay" for valid essay type', () => {
        expect(normalizeArticleType('essay')).toBe('essay')
      })

      it('should return "tool_announcement" for valid tool_announcement type', () => {
        expect(normalizeArticleType('tool_announcement')).toBe('tool_announcement')
      })

      it('should return "general" for valid general type', () => {
        expect(normalizeArticleType('general')).toBe('general')
      })

      it('should return "general" for undefined', () => {
        expect(normalizeArticleType(undefined)).toBe('general')
      })

      it('should return "general" for null', () => {
        expect(normalizeArticleType(null)).toBe('general')
      })

      it('should return "general" for invalid string', () => {
        expect(normalizeArticleType('invalid')).toBe('general')
      })

      it('should return "general" for non-string', () => {
        expect(normalizeArticleType(123)).toBe('general')
        expect(normalizeArticleType(true)).toBe('general')
        expect(normalizeArticleType({})).toBe('general')
      })
    })
  })

  describe('normalizeLang', () => {
    describe('Unit Tests', () => {
      it('should return "ja" for "ja"', () => {
        expect(normalizeLang('ja')).toBe('ja')
      })

      it('should return "en" for "en"', () => {
        expect(normalizeLang('en')).toBe('en')
      })

      it('should return "en" for undefined', () => {
        expect(normalizeLang(undefined)).toBe('en')
      })

      it('should return "en" for null', () => {
        expect(normalizeLang(null)).toBe('en')
      })

      it('should return "en" for invalid string', () => {
        expect(normalizeLang('fr')).toBe('en')
        expect(normalizeLang('invalid')).toBe('en')
      })

      it('should return "en" for non-string', () => {
        expect(normalizeLang(123)).toBe('en')
        expect(normalizeLang(true)).toBe('en')
        expect(normalizeLang({})).toBe('en')
      })
    })
  })

  describe('Property-Based Tests', () => {
    describe('Property 4: カスタムCTAデータの優先', () => {
      it('should validate custom CTA data correctly across all inputs', () => {
        // Feature: article-cta-component, Property 4: カスタムCTAデータの優先
        // **Validates: Requirements 6.2**

        // 有効なCTAButtonのarbitrary
        const validButton = fc.record({
          text: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          href: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          variant: fc.option(fc.constantFrom('primary', 'secondary', 'outline')),
        })

        // 有効なCTADataのarbitrary
        const validCTAData = fc.record({
          heading: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          buttons: fc.array(validButton, { minLength: 1, maxLength: 3 }),
        })

        fc.assert(
          fc.property(validCTAData, (ctaData) => {
            // 有効なCTADataは常にtrueを返すべき
            expect(isValidCTAData(ctaData)).toBe(true)
          }),
          { numRuns: 100 },
        )
      })

      it('should reject invalid CTA data structures', () => {
        // Feature: article-cta-component, Property 4: カスタムCTAデータの優先
        // **Validates: Requirements 6.2**

        // 無効なデータのarbitrary
        const invalidData = fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.string(),
          fc.integer(),
          fc.boolean(),
          // 空のbuttons配列
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.constant([]),
          }),
          // 4つ以上のbuttons
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.string() }), {
              minLength: 4,
              maxLength: 10,
            }),
          }),
          // headingが欠落
          fc.record({
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.string() }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          // descriptionが欠落
          fc.record({
            heading: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.string() }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          // buttonsが配列ではない
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.string(),
          }),
          // ボタンのtextが欠落
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(fc.record({ href: fc.string() }), { minLength: 1, maxLength: 3 }),
          }),
          // ボタンのhrefが欠落
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string() }), { minLength: 1, maxLength: 3 }),
          }),
          // 無効なvariant
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(
              fc.record({ text: fc.string(), href: fc.string(), variant: fc.constant('invalid') }),
              { minLength: 1, maxLength: 3 },
            ),
          }),
          // 空白のみのheading
          fc.record({
            heading: fc.constant('   '),
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.string() }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          // 空白のみのdescription
          fc.record({
            heading: fc.string(),
            description: fc.constant('   '),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.string() }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          // 空白のみのbutton text
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.constant('   '), href: fc.string() }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
          // 空白のみのbutton href
          fc.record({
            heading: fc.string(),
            description: fc.string(),
            buttons: fc.array(fc.record({ text: fc.string(), href: fc.constant('   ') }), {
              minLength: 1,
              maxLength: 3,
            }),
          }),
        )

        fc.assert(
          fc.property(invalidData, (data) => {
            // 無効なデータは常にfalseを返すべき
            expect(isValidCTAData(data)).toBe(false)
          }),
          { numRuns: 100 },
        )
      })
    })

    describe('Property: 記事タイプの正規化', () => {
      it('should normalize article types correctly across all inputs', () => {
        // Feature: article-cta-component
        // **Validates: Requirements 1.5**

        const validTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']

        fc.assert(
          fc.property(
            fc.oneof(
              fc.constantFrom(...validTypes),
              fc.string(),
              fc.constant(null),
              fc.constant(undefined),
              fc.integer(),
              fc.boolean(),
            ),
            (input) => {
              const result = normalizeArticleType(input)

              // 結果は常に有効なArticleTypeであるべき
              expect(validTypes).toContain(result)

              // 有効な入力の場合、そのまま返すべき
              if (typeof input === 'string' && validTypes.includes(input as ArticleType)) {
                expect(result).toBe(input)
              } else {
                // 無効な入力の場合、'general'にフォールバックすべき
                expect(result).toBe('general')
              }
            },
          ),
          { numRuns: 100 },
        )
      })
    })

    describe('Property: 言語コードの正規化', () => {
      it('should normalize language codes correctly across all inputs', () => {
        // Feature: article-cta-component

        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant('ja'),
              fc.constant('en'),
              fc.string(),
              fc.constant(null),
              fc.constant(undefined),
              fc.integer(),
              fc.boolean(),
            ),
            (input) => {
              const result = normalizeLang(input)

              // 結果は常に'ja'または'en'であるべき
              expect(['ja', 'en']).toContain(result)

              // 'ja'の場合、そのまま返すべき
              if (input === 'ja') {
                expect(result).toBe('ja')
              } else {
                // それ以外の場合、'en'にフォールバックすべき
                expect(result).toBe('en')
              }
            },
          ),
          { numRuns: 100 },
        )
      })
    })
  })
})
