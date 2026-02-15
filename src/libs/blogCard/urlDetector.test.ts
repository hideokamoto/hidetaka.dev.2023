/**
 * urlDetectorのユニットテスト
 *
 * Feature: wordpress-url-to-blog-card
 *
 * このファイルは、urlDetectorモジュールの特定の例とエッジケースを検証します。
 */

import { describe, expect, it } from 'vitest'
import { detectIndependentUrls } from './urlDetector'

describe('urlDetector - Unit Tests', () => {
  describe('基本的なURL検出', () => {
    it('should detect a single independent URL in <p> tag', () => {
      const html = '<p>https://example.com</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com'])
    })

    it('should detect multiple independent URLs in separate <p> tags', () => {
      const html = `
        <p>https://example.com</p>
        <p>https://test.com</p>
        <p>https://another.org</p>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com', 'https://test.com', 'https://another.org'])
    })

    it('should detect URLs with http protocol', () => {
      const html = '<p>http://example.com</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['http://example.com'])
    })

    it('should detect URLs with paths and query parameters', () => {
      const html = '<p>https://example.com/path/to/page?param=value&other=123</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com/path/to/page?param=value&other=123'])
    })

    it('should detect URLs in <p> tags with attributes', () => {
      const html = '<p class="content" id="paragraph-1">https://example.com</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com'])
    })
  })

  describe('空のHTML・URLなしのHTML', () => {
    it('should return empty array for empty string', () => {
      const html = ''
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should return empty array for whitespace-only string', () => {
      const html = '   \n\t  '
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should return empty array for HTML without URLs', () => {
      const html = '<p>This is just text without any URLs</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should return empty array for HTML with only non-URL content', () => {
      const html = `
        <div>
          <h1>Title</h1>
          <p>Some paragraph text</p>
          <span>More text</span>
        </div>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should return empty array for HTML with URLs not in <p> tags', () => {
      const html = '<div>https://example.com</div><span>https://test.com</span>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })
  })

  describe('リンクタグ内のURL除外', () => {
    it('should not detect URLs inside <a> tags', () => {
      const html = '<a href="https://example.com">Link text</a>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect URL when same URL appears in both <a> and <p> tags', () => {
      const html = `
        <a href="https://example.com">Link</a>
        <p>https://example.com</p>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should detect independent URL but not linked URL', () => {
      const html = `
        <a href="https://linked.com">Link</a>
        <p>https://independent.com</p>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://independent.com'])
    })

    it('should handle <a> tags with single quotes', () => {
      const html = "<a href='https://example.com'>Link</a>"
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })
  })

  describe('画像URL除外', () => {
    it('should not detect .jpg URLs', () => {
      const html = '<p>https://example.com/image.jpg</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect .jpeg URLs', () => {
      const html = '<p>https://example.com/photo.jpeg</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect .png URLs', () => {
      const html = '<p>https://example.com/screenshot.png</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect .gif URLs', () => {
      const html = '<p>https://example.com/animation.gif</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect .webp URLs', () => {
      const html = '<p>https://example.com/modern.webp</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect .svg URLs', () => {
      const html = '<p>https://example.com/icon.svg</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect image URLs with query parameters', () => {
      const html = '<p>https://example.com/image.jpg?size=large&quality=high</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect image URLs with uppercase extensions', () => {
      const html = '<p>https://example.com/IMAGE.JPG</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })
  })

  describe('自サイトURL除外', () => {
    it('should not detect hidetaka.dev URLs', () => {
      const html = '<p>https://hidetaka.dev/blog/post</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect hidetaka.dev URLs with http', () => {
      const html = '<p>http://hidetaka.dev/about</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect hidetaka.dev URLs with subdomains', () => {
      const html = '<p>https://www.hidetaka.dev/page</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect hidetaka.dev URLs with paths and query parameters', () => {
      const html = '<p>https://hidetaka.dev/blog/post?id=123</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })

    it('should not detect hidetaka.dev URLs case-insensitively', () => {
      const html = '<p>https://HIDETAKA.DEV/page</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual([])
    })
  })

  describe('重複URL処理', () => {
    it('should remove duplicate URLs', () => {
      const html = `
        <p>https://example.com</p>
        <p>https://example.com</p>
        <p>https://example.com</p>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com'])
    })

    it('should keep last occurrence when deduplicating', () => {
      const html = `
        <p>https://example.com</p>
        <p>https://test.com</p>
        <p>https://example.com</p>
      `
      const result = detectIndependentUrls(html)

      // reduce + Mapパターンは最後の出現を保持する
      expect(result).toContain('https://example.com')
      expect(result).toContain('https://test.com')
      expect(result.length).toBe(2)
    })
  })

  describe('複合的なエッジケース', () => {
    it('should handle mixed content correctly', () => {
      const html = `
        <p>https://valid1.com</p>
        <a href="https://linked.com">Link</a>
        <p>https://example.com/image.jpg</p>
        <p>https://hidetaka.dev/blog</p>
        <p>https://valid2.com</p>
      `
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://valid1.com', 'https://valid2.com'])
    })

    it('should handle empty <p> tags', () => {
      const html = '<p></p><p>https://example.com</p><p></p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com'])
    })

    it('should handle <p> tags with text before and after URL', () => {
      const html = '<p>Check this out: https://example.com for more info</p>'
      const result = detectIndependentUrls(html)

      // URLが独立していない（前後にテキストがある）ため検出されない
      expect(result).toEqual([])
    })

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>https://example.com<p>https://test.com</p>'
      const result = detectIndependentUrls(html)

      // 閉じタグがある方のみ検出される
      expect(result).toContain('https://test.com')
    })

    it('should handle URLs with special characters in path', () => {
      const html = '<p>https://example.com/path-with-dashes_and_underscores/page</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com/path-with-dashes_and_underscores/page'])
    })

    it('should handle URLs with port numbers', () => {
      const html = '<p>https://example.com:8080/page</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com:8080/page'])
    })

    it('should handle URLs with fragments', () => {
      const html = '<p>https://example.com/page#section</p>'
      const result = detectIndependentUrls(html)

      expect(result).toEqual(['https://example.com/page#section'])
    })
  })
})
