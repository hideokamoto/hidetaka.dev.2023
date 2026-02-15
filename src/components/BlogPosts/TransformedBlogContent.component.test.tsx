/**
 * TransformedBlogContent ユニットテスト
 *
 * Feature: wordpress-url-to-blog-card
 *
 * このファイルは、TransformedBlogContentコンポーネントのエラーハンドリングとログ記録を検証します。
 * 要件: 6.1, 6.2, 6.3, 6.5
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import TransformedBlogContent from './TransformedBlogContent'
import type { WPThought } from '@/libs/blogCard/types'
import * as urlDetector from '@/libs/blogCard/urlDetector'
import * as blogCardTransformer from '@/libs/blogCard/blogCardTransformer'

describe('TransformedBlogContent - Unit Tests', () => {
  // コンソールのモック
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // console.logとconsole.errorをモック
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // モックをリストア
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    vi.restoreAllMocks()
  })

  // テスト用のWPThoughtオブジェクトを作成するヘルパー関数
  const createMockThought = (content: string): WPThought => ({
    id: 123,
    title: { rendered: 'Test Post' },
    content: { rendered: content },
    excerpt: { rendered: 'Test excerpt' },
    date: '2024-01-01T00:00:00',
    slug: 'test-post',
    link: 'https://example.com/test-post',
    categories: [1],
  })

  describe('正常系: URL変換の成功', () => {
    it('should transform URLs and log success message', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      render(<TransformedBlogContent thought={thought} />)

      // console.logが呼ばれたことを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Successfully transformed 1 URL(s) to blog cards',
        expect.objectContaining({
          thoughtId: 123,
          thoughtSlug: 'test-post',
          detectedUrls: ['https://example.com'],
        }),
      )
    })

    it('should log multiple URLs when multiple URLs are detected', () => {
      const html = '<p>https://example.com</p><p>https://test.com</p>'
      const thought = createMockThought(html)

      render(<TransformedBlogContent thought={thought} />)

      // console.logが呼ばれたことを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Successfully transformed 2 URL(s) to blog cards',
        expect.objectContaining({
          thoughtId: 123,
          thoughtSlug: 'test-post',
          detectedUrls: ['https://example.com', 'https://test.com'],
        }),
      )
    })

    it('should not log when no URLs are detected', () => {
      const html = '<p>Just some text without URLs</p>'
      const thought = createMockThought(html)

      render(<TransformedBlogContent thought={thought} />)

      // console.logが呼ばれていないことを確認
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('エラーハンドリング: URL検出エラー', () => {
    it('should handle detectIndependentUrls error and return original HTML', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      // detectIndependentUrlsがエラーをスローするようにモック
      vi.spyOn(urlDetector, 'detectIndependentUrls').mockImplementation(() => {
        throw new Error('URL detection failed')
      })

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーがログに記録されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Failed to transform URLs to blog cards',
        expect.objectContaining({
          thoughtId: 123,
          thoughtSlug: 'test-post',
          error: expect.objectContaining({
            message: 'URL detection failed',
            stack: expect.any(String),
          }),
        }),
      )

      // 元のHTMLが返されることを確認
      expect(container.innerHTML).toContain('<p>https://example.com</p>')
    })

    it('should handle non-Error exceptions', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      // detectIndependentUrlsが文字列をスローするようにモック
      vi.spyOn(urlDetector, 'detectIndependentUrls').mockImplementation(() => {
        throw 'String error'
      })

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーがログに記録されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Failed to transform URLs to blog cards',
        expect.objectContaining({
          thoughtId: 123,
          thoughtSlug: 'test-post',
          error: 'String error',
        }),
      )

      // 元のHTMLが返されることを確認
      expect(container.innerHTML).toContain('<p>https://example.com</p>')
    })
  })

  describe('エラーハンドリング: URL変換エラー', () => {
    it('should handle transformUrlsToBlogCards error and return original HTML', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      // transformUrlsToBlogCardsがエラーをスローするようにモック
      vi.spyOn(blogCardTransformer, 'transformUrlsToBlogCards').mockImplementation(() => {
        throw new Error('URL transformation failed')
      })

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーがログに記録されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Failed to transform URLs to blog cards',
        expect.objectContaining({
          thoughtId: 123,
          thoughtSlug: 'test-post',
          error: expect.objectContaining({
            message: 'URL transformation failed',
            stack: expect.any(String),
          }),
        }),
      )

      // 元のHTMLが返されることを確認
      expect(container.innerHTML).toContain('<p>https://example.com</p>')
    })

    it('should log error with correct thought metadata', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)
      thought.id = 456
      thought.slug = 'custom-slug'

      // transformUrlsToBlogCardsがエラーをスローするようにモック
      vi.spyOn(blogCardTransformer, 'transformUrlsToBlogCards').mockImplementation(() => {
        throw new Error('Transformation error')
      })

      render(<TransformedBlogContent thought={thought} />)

      // エラーログに正しいメタデータが含まれることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TransformedBlogContent] Failed to transform URLs to blog cards',
        expect.objectContaining({
          thoughtId: 456,
          thoughtSlug: 'custom-slug',
        }),
      )
    })
  })

  describe('エラーハンドリング: 不正なHTML', () => {
    it('should handle malformed HTML gracefully', () => {
      // 閉じタグがないHTML
      const html = '<p>https://example.com<p>https://test.com</p>'
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーが発生しないことを確認（正常に処理される）
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      // HTMLが含まれることを確認
      expect(container.innerHTML).toBeTruthy()
    })

    it('should handle empty HTML', () => {
      const html = ''
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーが発生しないことを確認
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      // 空のdivが返されることを確認
      expect(container.querySelector('div')).toBeTruthy()
    })

    it('should handle HTML with only whitespace', () => {
      const html = '   \n\t  '
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーが発生しないことを確認
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      // divが返されることを確認
      expect(container.querySelector('div')).toBeTruthy()
    })

    it('should handle HTML with nested tags', () => {
      const html = '<div><section><p>https://example.com</p></section></div>'
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // エラーが発生しないことを確認
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      // 変換されたHTMLが含まれることを確認
      expect(container.innerHTML).toContain('<iframe')
    })
  })

  describe('ログ記録の詳細', () => {
    it('should log with correct format for success', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      render(<TransformedBlogContent thought={thought} />)

      // ログのフォーマットを確認
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TransformedBlogContent]'),
        expect.objectContaining({
          thoughtId: expect.any(Number),
          thoughtSlug: expect.any(String),
          detectedUrls: expect.any(Array),
        }),
      )
    })

    it('should log with correct format for error', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      // エラーをスローするようにモック
      vi.spyOn(urlDetector, 'detectIndependentUrls').mockImplementation(() => {
        throw new Error('Test error')
      })

      render(<TransformedBlogContent thought={thought} />)

      // エラーログのフォーマットを確認
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TransformedBlogContent]'),
        expect.objectContaining({
          thoughtId: expect.any(Number),
          thoughtSlug: expect.any(String),
          error: expect.anything(),
        }),
      )
    })

    it('should include error stack trace in log', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      // エラーをスローするようにモック
      vi.spyOn(urlDetector, 'detectIndependentUrls').mockImplementation(() => {
        throw new Error('Test error with stack')
      })

      render(<TransformedBlogContent thought={thought} />)

      // スタックトレースが含まれることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error with stack',
            stack: expect.any(String),
          }),
        }),
      )
    })
  })

  describe('classNameプロパティ', () => {
    it('should apply className to the div element', () => {
      const html = '<p>Test content</p>'
      const thought = createMockThought(html)
      const className = 'custom-class test-class'

      const { container } = render(<TransformedBlogContent thought={thought} className={className} />)

      // classNameが適用されることを確認
      const div = container.querySelector('div')
      expect(div).toBeTruthy()
      expect(div?.className).toBe(className)
    })

    it('should work without className prop', () => {
      const html = '<p>Test content</p>'
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // classNameなしでも動作することを確認
      const div = container.querySelector('div')
      expect(div).toBeTruthy()
    })
  })

  describe('フォールバック動作', () => {
    it('should always render original HTML on error', () => {
      const html = '<p>https://example.com</p><div>Important content</div>'
      const thought = createMockThought(html)

      // エラーをスローするようにモック
      vi.spyOn(urlDetector, 'detectIndependentUrls').mockImplementation(() => {
        throw new Error('Detection failed')
      })

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // 元のHTMLがすべて保持されることを確認
      expect(container.innerHTML).toContain('<p>https://example.com</p>')
      expect(container.innerHTML).toContain('<div>Important content</div>')
    })

    it('should not lose content when transformation fails', () => {
      const html = `
        <h1>Title</h1>
        <p>https://example.com</p>
        <p>Some important text</p>
        <p>https://test.com</p>
      `
      const thought = createMockThought(html)

      // 変換エラーをシミュレート
      vi.spyOn(blogCardTransformer, 'transformUrlsToBlogCards').mockImplementation(() => {
        throw new Error('Transformation failed')
      })

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // すべてのコンテンツが保持されることを確認
      expect(container.innerHTML).toContain('<h1>Title</h1>')
      expect(container.innerHTML).toContain('<p>https://example.com</p>')
      expect(container.innerHTML).toContain('<p>Some important text</p>')
      expect(container.innerHTML).toContain('<p>https://test.com</p>')
    })
  })

  describe('統合シナリオ', () => {
    it('should handle complete workflow: detect -> transform -> render', () => {
      const html = '<p>https://example.com</p>'
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // iframeが生成されることを確認
      expect(container.innerHTML).toContain('<iframe')
      expect(container.innerHTML).toContain('url=https%3A%2F%2Fexample.com')

      // 成功ログが記録されることを確認
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should handle workflow with no URLs', () => {
      const html = '<p>Just text</p><div>More content</div>'
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // 元のHTMLがそのまま返されることを確認
      expect(container.innerHTML).toContain('<p>Just text</p>')
      expect(container.innerHTML).toContain('<div>More content</div>')

      // ログが記録されないことを確認
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should handle workflow with mixed content', () => {
      const html = `
        <h1>Blog Post</h1>
        <p>Introduction text</p>
        <p>https://example.com</p>
        <p>More text</p>
        <p>https://test.com</p>
        <p>Conclusion</p>
      `
      const thought = createMockThought(html)

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // URLが変換されることを確認
      expect(container.innerHTML).toContain('<iframe')

      // 他のコンテンツが保持されることを確認
      expect(container.innerHTML).toContain('<h1>Blog Post</h1>')
      expect(container.innerHTML).toContain('<p>Introduction text</p>')
      expect(container.innerHTML).toContain('<p>More text</p>')
      expect(container.innerHTML).toContain('<p>Conclusion</p>')

      // 成功ログが記録されることを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          detectedUrls: ['https://example.com', 'https://test.com'],
        }),
      )
    })
  })
})
