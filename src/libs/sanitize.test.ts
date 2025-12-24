import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { removeHtmlTags } from './sanitize'

describe('removeHtmlTags', () => {
  it('should remove simple HTML tags', () => {
    expect(removeHtmlTags('<p>Hello</p>')).toBe('Hello')
  })

  it('should remove multiple tags', () => {
    expect(removeHtmlTags('<div><strong>Bold</strong> text</div>')).toBe('Bold text')
  })

  it('should remove self-closing tags', () => {
    expect(removeHtmlTags('Line 1<br/>Line 2')).toBe('Line 1Line 2')
  })

  it('should remove tags with attributes', () => {
    expect(removeHtmlTags('<a href="https://example.com">Link</a>')).toBe('Link')
  })

  it('should remove nested tags', () => {
    expect(removeHtmlTags('<div><span><em>Nested</em></span></div>')).toBe('Nested')
  })

  it('should replace [&hellip;] with ...', () => {
    expect(removeHtmlTags('Read more [&hellip;]')).toBe('Read more...')
  })

  it('should handle text with no HTML tags', () => {
    expect(removeHtmlTags('Plain text')).toBe('Plain text')
  })

  it('should handle empty string', () => {
    expect(removeHtmlTags('')).toBe('')
  })

  it('should handle string with only tags', () => {
    expect(removeHtmlTags('<div></div>')).toBe('')
  })

  it('should preserve spaces between words', () => {
    expect(removeHtmlTags('<p>Hello</p> <p>World</p>')).toBe('Hello World')
  })

  it('should handle complex HTML structure', () => {
    const html = '<article><h1>Title</h1><p>First paragraph.</p><p>Second paragraph.</p></article>'
    expect(removeHtmlTags(html)).toBe('TitleFirst paragraph.Second paragraph.')
  })

  it('should return input if falsy', () => {
    expect(removeHtmlTags(null)).toBe(null)
    expect(removeHtmlTags(undefined)).toBe(undefined)
  })

  describe('property-based tests', () => {
    // HTMLタグを含まない文字列を生成
    const plainText = fc.string({ minLength: 0, maxLength: 100 })

    // HTMLタグを含む可能性のある文字列を生成
    const htmlString = fc.string({ minLength: 0, maxLength: 200 })

    it('should not contain HTML tags in output', () => {
      fc.assert(
        fc.property(htmlString, (str) => {
          const result = removeHtmlTags(str)
          if (result === null || result === undefined) return true
          // 結果に有効なHTMLタグ（<tag>形式）が含まれていないことを確認
          expect(result).not.toMatch(/<[a-z][a-z0-9]*[^>]*>/i)
        }),
      )
    })

    it('should be idempotent (applying twice produces same result)', () => {
      fc.assert(
        fc.property(htmlString, (str) => {
          const result1 = removeHtmlTags(str)
          const result2 = removeHtmlTags(result1 as string)
          expect(result1).toBe(result2)
        }),
      )
    })

    it('should preserve plain text without HTML tags', () => {
      fc.assert(
        fc.property(plainText, (text) => {
          // HTMLタグが含まれていない場合、結果は元の文字列と同じか、[&hellip;]が...に置換されたもの
          const result = removeHtmlTags(text)
          if (text.includes('[&hellip;]')) {
            expect(result).toBe(text.replace(/ \[&hellip;\]/, '...'))
          } else {
            expect(result).toBe(text)
          }
        }),
      )
    })

    it('should handle null and undefined consistently', () => {
      fc.assert(
        fc.property(fc.constantFrom(null, undefined), (value) => {
          const result = removeHtmlTags(value as null | undefined)
          expect(result).toBe(value)
        }),
      )
    })

    describe('実際に使用されるHTMLタグ', () => {
      it('should remove common HTML tags', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.constantFrom(
                'div',
                'span',
                'p',
                'a',
                'strong',
                'em',
                'h1',
                'h2',
                'h3',
                'ul',
                'li',
                'img',
                'br',
              ),
              { minLength: 0, maxLength: 10 },
            ),
            fc.array(
              fc
                .string({ minLength: 1, maxLength: 20 })
                .filter((s) => !s.includes('<') && !s.includes('>')),
              { minLength: 0, maxLength: 10 },
            ),
            (tags, texts) => {
              // タグとテキストを交互に配置したHTMLを生成
              let html = ''
              for (let i = 0; i < Math.max(tags.length, texts.length); i++) {
                if (tags[i]) html += `<${tags[i]}>`
                if (texts[i]) html += texts[i]
                if (tags[i]) html += `</${tags[i]}>`
              }
              const result = removeHtmlTags(html)
              // 結果にHTMLタグが含まれていないことを確認
              expect(result).not.toMatch(/<[a-z][a-z0-9]*[^>]*>/i)
              // テキスト部分は保持されている
              for (const text of texts) {
                if (text) expect(result).toContain(text)
              }
            },
          ),
        )
      })
    })

    describe('境界値テスト', () => {
      it('should remove HTML tags with various nesting depths', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z][a-z0-9]*$/i.test(s)),
              { minLength: 1, maxLength: 5 },
            ),
            fc.array(
              fc
                .string({ minLength: 1, maxLength: 20 })
                .filter((s) => !s.includes('<') && !s.includes('>')),
              { minLength: 0, maxLength: 5 },
            ),
            (tags, texts) => {
              // タグとテキストを交互に配置したHTMLを生成
              let html = ''
              for (let i = 0; i < Math.max(tags.length, texts.length); i++) {
                if (tags[i]) html += `<${tags[i]}>`
                if (texts[i]) html += texts[i]
                if (tags[i]) html += `</${tags[i]}>`
              }
              const result = removeHtmlTags(html)
              // 結果にHTMLタグが含まれていないことを確認
              expect(result).not.toMatch(/<[a-z][a-z0-9]*[^>]*>/i)
              // テキスト部分は保持されている
              for (const text of texts) {
                if (text) expect(result).toContain(text)
              }
            },
          ),
        )
      })
    })

    it('should replace [&hellip;] with ... consistently', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 0, maxLength: 50 })
            .filter((s) => !s.includes('<') && !s.includes('>')),
          fc
            .string({ minLength: 0, maxLength: 50 })
            .filter((s) => !s.includes('<') && !s.includes('>')),
          (before, after) => {
            const input = `${before} [&hellip;] ${after}`
            const result = removeHtmlTags(input)
            expect(result).toContain('...')
            expect(result).not.toContain('[&hellip;]')
          },
        ),
      )
    })
  })
})
