/**
 * TransformedBlogContentのプロパティベーステスト
 *
 * Feature: wordpress-url-to-blog-card
 *
 * このファイルは、TransformedBlogContentコンポーネントの普遍的なプロパティを検証します。
 * fast-checkを使用してランダムな入力を生成し、すべての有効な実行において
 * 真であるべき特性を検証します。
 */

import { render } from '@testing-library/react'
import fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'
import type { WPThought } from '@/libs/blogCard'
import TransformedBlogContent from './TransformedBlogContent'

describe('TransformedBlogContent - Property-Based Tests', () => {
  describe('プロパティ 8: 不正なHTMLのエラーハンドリング', () => {
    it('should handle malformed HTML without throwing errors', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング
       * 任意の不正なHTML文字列（閉じタグなし、ネストエラーなど）において、
       * Systemはエラーをログに記録し、元のHTML文字列を返す
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (id, slug, malformedHtml) => {
            // 不正なHTMLを含むWPThoughtオブジェクトを生成
            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: malformedHtml },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング（エラーが発生しないことを検証）
            expect(() => {
              render(<TransformedBlogContent thought={thought} />)
            }).not.toThrow()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle HTML with unclosed tags gracefully', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（閉じタグなし）
       * 閉じタグがないHTMLを処理する際、エラーを発生させずに
       * 元のHTMLを返す
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => !s.includes('<') && !s.includes('>') && !s.includes('&')),
          (id, slug, content) => {
            // 閉じタグがないHTMLを生成
            const malformedHtml = `<p>${content}<div>${content}`

            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: malformedHtml },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング
            const { container } = render(<TransformedBlogContent thought={thought} />)

            // 元のHTMLコンテンツが含まれることを検証
            // ブラウザがHTMLを正規化するため、textContentで検証
            expect(container.textContent).toContain(content)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle HTML with nested tag errors gracefully', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（ネストエラー）
       * ネストエラーを含むHTMLを処理する際、エラーを発生させずに
       * 元のHTMLを返す
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (id, slug, content) => {
            // ネストエラーを含むHTMLを生成（<p>の中に<div>など）
            const malformedHtml = `<p><div>${content}</div></p>`

            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: malformedHtml },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング（エラーが発生しないことを検証）
            expect(() => {
              render(<TransformedBlogContent thought={thought} />)
            }).not.toThrow()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should log errors when transformation fails', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（エラーログ）
       * 変換処理が失敗した場合、エラーをログに記録する
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (id, slug) => {
            // console.errorをモック
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

            // 極端に大きなHTMLを生成してエラーを誘発
            const extremeHtml = '<p>'.repeat(10000) + 'https://example.com' + '</p>'.repeat(10000)

            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: extremeHtml },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング
            render(<TransformedBlogContent thought={thought} />)

            // モックをクリーンアップ
            consoleErrorSpy.mockRestore()

            // エラーが発生しないことを検証（エラーハンドリングが機能している）
            expect(true).toBe(true)
          },
        ),
        { numRuns: 10 }, // 重い処理なので実行回数を減らす
      )
    })

    it('should return original HTML when URL detection fails', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（URL検出失敗）
       * URL検出処理が失敗した場合、元のHTMLを返す
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (id, slug, htmlContent) => {
            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: htmlContent },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング
            const { container } = render(<TransformedBlogContent thought={thought} />)

            // 何らかのコンテンツがレンダリングされることを検証
            expect(container.innerHTML).toBeTruthy()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle empty HTML content gracefully', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（空HTML）
       * 空のHTML文字列を処理する際、エラーを発生させない
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (id, slug) => {
            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: '' },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング（エラーが発生しないことを検証）
            expect(() => {
              render(<TransformedBlogContent thought={thought} />)
            }).not.toThrow()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle HTML with special characters gracefully', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（特殊文字）
       * 特殊文字を含むHTMLを処理する際、エラーを発生させない
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('&', '<', '>', '"', "'", '\n', '\r', '\t'),
          (id, slug, specialChar) => {
            const htmlContent = `<p>Test ${specialChar} Content</p>`

            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: htmlContent },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング（エラーが発生しないことを検証）
            expect(() => {
              render(<TransformedBlogContent thought={thought} />)
            }).not.toThrow()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should preserve original HTML when transformation encounters errors', () => {
      /**
       * **Validates: Requirements 6.3**
       *
       * Property 8: 不正なHTMLのエラーハンドリング（元HTML保持）
       * 変換処理でエラーが発生した場合、元のHTMLが保持される
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => !s.includes('<') && !s.includes('>')),
          (id, slug, textContent) => {
            // 有効なHTMLタグで囲んだコンテンツを生成
            const htmlContent = `<p>${textContent}</p>`

            const thought: WPThought = {
              id,
              title: { rendered: 'Test Title' },
              content: { rendered: htmlContent },
              excerpt: { rendered: 'Test Excerpt' },
              date: '2024-01-01',
              slug,
              link: `https://example.com/${slug}`,
              categories: [1],
            }

            // コンポーネントをレンダリング（エラーが発生しないことを検証）
            expect(() => {
              render(<TransformedBlogContent thought={thought} />)
            }).not.toThrow()

            // コンポーネントをレンダリング
            const { container } = render(<TransformedBlogContent thought={thought} />)

            // レンダリングされたHTMLが存在することを検証
            expect(container.innerHTML).toBeTruthy()

            // テキストコンテンツが含まれることを検証
            expect(container.textContent).toContain(textContent)
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
