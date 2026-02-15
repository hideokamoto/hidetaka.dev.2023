/**
 * TransformedBlogContent 統合テスト
 *
 * BlogDetailPageとTransformedBlogContentの統合をテストし、
 * スタイリングが維持されることを確認します。
 *
 * 要件: 8.2, 8.3
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { WPThought } from '@/libs/blogCard'
import TransformedBlogContent from './TransformedBlogContent'

describe('TransformedBlogContent Integration Tests', () => {
  describe('基本的なレンダリング', () => {
    it('should render transformed content with blog card iframes', () => {
      const thought: WPThought = {
        id: 1,
        slug: 'test-post',
        title: { rendered: 'Test Post' },
        content: {
          rendered: '<p>Check this out:</p><p>https://example.com</p><p>Great article!</p>',
        },
        excerpt: { rendered: 'Test excerpt' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/test-post',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // iframeが生成されていることを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe?.getAttribute('src')).toContain(
        'https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com',
      )
      expect(iframe?.getAttribute('loading')).toBe('lazy')

      // 他のコンテンツが保持されていることを確認
      expect(container.innerHTML).toContain('<p>Check this out:</p>')
      expect(container.innerHTML).toContain('<p>Great article!</p>')
    })

    it('should render original content when no URLs are detected', () => {
      const thought: WPThought = {
        id: 2,
        slug: 'no-urls',
        title: { rendered: 'No URLs' },
        content: {
          rendered: '<p>This is a post without any URLs.</p><p>Just plain text.</p>',
        },
        excerpt: { rendered: 'No URLs' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/no-urls',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // iframeが生成されていないことを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeNull()

      // 元のコンテンツが保持されていることを確認
      expect(container.innerHTML).toContain('<p>This is a post without any URLs.</p>')
      expect(container.innerHTML).toContain('<p>Just plain text.</p>')
    })

    it('should handle multiple URLs in content', () => {
      const thought: WPThought = {
        id: 3,
        slug: 'multiple-urls',
        title: { rendered: 'Multiple URLs' },
        content: {
          rendered:
            '<p>First link:</p><p>https://example.com</p><p>Second link:</p><p>https://test.com</p>',
        },
        excerpt: { rendered: 'Multiple URLs' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/multiple-urls',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // 2つのiframeが生成されていることを確認
      const iframes = container.querySelectorAll('iframe')
      expect(iframes.length).toBe(2)

      // 両方のURLが変換されていることを確認
      expect(iframes[0]?.getAttribute('src')).toContain('url=https%3A%2F%2Fexample.com')
      expect(iframes[1]?.getAttribute('src')).toContain('url=https%3A%2F%2Ftest.com')
    })
  })

  describe('スタイリングの維持', () => {
    it('should apply className prop to the container div', () => {
      const thought: WPThought = {
        id: 4,
        slug: 'styled-post',
        title: { rendered: 'Styled Post' },
        content: {
          rendered: '<p>Content with styling</p>',
        },
        excerpt: { rendered: 'Styled' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/styled-post',
        categories: [1],
      }

      const className = 'blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed'
      const { container } = render(<TransformedBlogContent thought={thought} className={className} />)

      // classNameが適用されていることを確認
      const div = container.querySelector('div')
      expect(div?.className).toBe(className)
    })

    it('should maintain styling when URLs are transformed', () => {
      const thought: WPThought = {
        id: 5,
        slug: 'styled-with-url',
        title: { rendered: 'Styled with URL' },
        content: {
          rendered: '<p>https://example.com</p>',
        },
        excerpt: { rendered: 'Styled with URL' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/styled-with-url',
        categories: [1],
      }

      const className = 'blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed'
      const { container } = render(<TransformedBlogContent thought={thought} className={className} />)

      // classNameが適用されていることを確認
      const div = container.querySelector('div')
      expect(div?.className).toBe(className)

      // iframeが生成されていることを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
    })

    it('should work without className prop', () => {
      const thought: WPThought = {
        id: 6,
        slug: 'no-class',
        title: { rendered: 'No Class' },
        content: {
          rendered: '<p>Content without className</p>',
        },
        excerpt: { rendered: 'No Class' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/no-class',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // divが存在することを確認
      const div = container.querySelector('div')
      expect(div).toBeTruthy()

      // classNameが空であることを確認
      expect(div?.className).toBe('')
    })
  })

  describe('除外条件の統合テスト', () => {
    it('should not transform URLs inside link tags', () => {
      const thought: WPThought = {
        id: 7,
        slug: 'with-links',
        title: { rendered: 'With Links' },
        content: {
          rendered:
            '<p><a href="https://example.com">Link text</a></p><p>https://test.com</p>',
        },
        excerpt: { rendered: 'With Links' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/with-links',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // リンクタグ内のURLは変換されない
      expect(container.innerHTML).toContain('<a href="https://example.com">Link text</a>')

      // 独立したURLは変換される
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe?.getAttribute('src')).toContain('url=https%3A%2F%2Ftest.com')

      // iframeは1つだけ
      const iframes = container.querySelectorAll('iframe')
      expect(iframes.length).toBe(1)
    })

    it('should not transform image URLs', () => {
      const thought: WPThought = {
        id: 8,
        slug: 'with-images',
        title: { rendered: 'With Images' },
        content: {
          rendered:
            '<p>https://example.com/image.jpg</p><p>https://example.com/photo.png</p><p>https://test.com</p>',
        },
        excerpt: { rendered: 'With Images' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/with-images',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // 画像URLは変換されない
      expect(container.innerHTML).toContain('<p>https://example.com/image.jpg</p>')
      expect(container.innerHTML).toContain('<p>https://example.com/photo.png</p>')

      // 通常のURLは変換される
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe?.getAttribute('src')).toContain('url=https%3A%2F%2Ftest.com')

      // iframeは1つだけ
      const iframes = container.querySelectorAll('iframe')
      expect(iframes.length).toBe(1)
    })

    it('should not transform own site URLs', () => {
      const thought: WPThought = {
        id: 9,
        slug: 'with-own-site',
        title: { rendered: 'With Own Site' },
        content: {
          rendered:
            '<p>https://hidetaka.dev/blog/post</p><p>https://example.com</p>',
        },
        excerpt: { rendered: 'With Own Site' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/with-own-site',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // 自サイトURLは変換されない
      expect(container.innerHTML).toContain('<p>https://hidetaka.dev/blog/post</p>')

      // 外部URLは変換される
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe?.getAttribute('src')).toContain('url=https%3A%2F%2Fexample.com')

      // iframeは1つだけ
      const iframes = container.querySelectorAll('iframe')
      expect(iframes.length).toBe(1)
    })
  })

  describe('エラーハンドリングの統合テスト', () => {
    it('should render original content when transformation fails', () => {
      // 不正なHTMLを含むthought
      const thought: WPThought = {
        id: 10,
        slug: 'malformed-html',
        title: { rendered: 'Malformed HTML' },
        content: {
          rendered: '<p>Unclosed paragraph<p>https://example.com</p>',
        },
        excerpt: { rendered: 'Malformed' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/malformed-html',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // コンテンツがレンダリングされることを確認（エラーでクラッシュしない）
      const div = container.querySelector('div')
      expect(div).toBeTruthy()
      expect(div?.innerHTML).toBeTruthy()
    })

    it('should handle empty content gracefully', () => {
      const thought: WPThought = {
        id: 11,
        slug: 'empty-content',
        title: { rendered: 'Empty Content' },
        content: {
          rendered: '',
        },
        excerpt: { rendered: 'Empty' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/empty-content',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // divが存在することを確認
      const div = container.querySelector('div')
      expect(div).toBeTruthy()

      // 空のコンテンツが正しく処理されることを確認
      expect(div?.innerHTML).toBe('')
    })
  })

  describe('複雑なHTMLの統合テスト', () => {
    it('should handle complex HTML with mixed content', () => {
      const thought: WPThought = {
        id: 12,
        slug: 'complex-html',
        title: { rendered: 'Complex HTML' },
        content: {
          rendered: `
            <h2>Introduction</h2>
            <p>This is a blog post with various elements.</p>
            <p>https://example.com</p>
            <blockquote>
              <p>A quote from someone</p>
            </blockquote>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <p>https://test.com</p>
            <pre><code>const x = 1;</code></pre>
          `,
        },
        excerpt: { rendered: 'Complex' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/complex-html',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // すべての要素が保持されていることを確認
      expect(container.innerHTML).toContain('<h2>Introduction</h2>')
      expect(container.innerHTML).toContain('<blockquote>')
      expect(container.innerHTML).toContain('<ul>')
      expect(container.innerHTML).toContain('<pre><code>const x = 1;</code></pre>')

      // 2つのiframeが生成されていることを確認
      const iframes = container.querySelectorAll('iframe')
      expect(iframes.length).toBe(2)
      expect(iframes[0]?.getAttribute('src')).toContain('url=https%3A%2F%2Fexample.com')
      expect(iframes[1]?.getAttribute('src')).toContain('url=https%3A%2F%2Ftest.com')
    })

    it('should preserve HTML structure and nesting', () => {
      const thought: WPThought = {
        id: 13,
        slug: 'nested-html',
        title: { rendered: 'Nested HTML' },
        content: {
          rendered: `
            <div class="content">
              <section>
                <p>https://example.com</p>
              </section>
            </div>
          `,
        },
        excerpt: { rendered: 'Nested' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/nested-html',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // ネストされた構造が保持されていることを確認
      expect(container.innerHTML).toContain('<div class="content">')
      expect(container.innerHTML).toContain('<section>')
      expect(container.innerHTML).toContain('</section>')
      expect(container.innerHTML).toContain('</div>')

      // iframeが生成されていることを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
    })
  })

  describe('BlogDetailPageとの統合', () => {
    it('should work with the same className used in BlogDetailPage', () => {
      const thought: WPThought = {
        id: 14,
        slug: 'blog-detail-page-integration',
        title: { rendered: 'Blog Detail Page Integration' },
        content: {
          rendered: '<p>https://example.com</p><p>Content from WordPress</p>',
        },
        excerpt: { rendered: 'Integration' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/blog-detail-page-integration',
        categories: [1],
      }

      // BlogDetailPageで使用されているclassNameと同じものを使用
      const className = 'blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed'
      const { container } = render(<TransformedBlogContent thought={thought} className={className} />)

      // classNameが正しく適用されていることを確認
      const div = container.querySelector('div')
      expect(div?.className).toBe(className)

      // コンテンツが正しく変換されていることを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(container.innerHTML).toContain('<p>Content from WordPress</p>')
    })

    it('should replace dangerouslySetInnerHTML behavior correctly', () => {
      const thought: WPThought = {
        id: 15,
        slug: 'dangerous-html-replacement',
        title: { rendered: 'Dangerous HTML Replacement' },
        content: {
          rendered: '<p><strong>Bold text</strong> and <em>italic text</em></p><p>https://example.com</p>',
        },
        excerpt: { rendered: 'Replacement' },
        date: '2024-01-01T00:00:00',
        link: 'https://wp-api.wp-kyoto.net/dangerous-html-replacement',
        categories: [1],
      }

      const { container } = render(<TransformedBlogContent thought={thought} />)

      // HTMLタグが正しくレンダリングされていることを確認
      expect(container.innerHTML).toContain('<strong>Bold text</strong>')
      expect(container.innerHTML).toContain('<em>italic text</em>')

      // URLが変換されていることを確認
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
    })
  })
})
