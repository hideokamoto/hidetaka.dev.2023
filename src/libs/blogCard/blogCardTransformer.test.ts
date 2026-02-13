/**
 * blogCardTransformer ユニットテスト
 *
 * 特定の例とエッジケースを検証します。
 */

import { describe, expect, it } from 'vitest'
import { transformUrlsToBlogCards } from './blogCardTransformer'

describe('blogCardTransformer', () => {
  describe('transformUrlsToBlogCards', () => {
    it('should transform a single URL to iframe tag', () => {
      const html = '<p>https://example.com</p>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain(
        'src="https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com"',
      )
      expect(result).toContain('loading="lazy"')
      expect(result).not.toContain('<p>https://example.com</p>')
    })

    it('should escape URL with encodeURIComponent', () => {
      const html = '<p>https://example.com/path?query=value&foo=bar</p>'
      const urls = ['https://example.com/path?query=value&foo=bar']
      const result = transformUrlsToBlogCards(html, urls)

      // URLがエスケープされていることを確認
      expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue%26foo%3Dbar')
    })

    it('should include loading="lazy" attribute', () => {
      const html = '<p>https://example.com</p>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('loading="lazy"')
    })

    it('should transform multiple URLs to individual iframe tags', () => {
      const html = '<p>https://example.com</p><p>https://test.com</p>'
      const urls = ['https://example.com', 'https://test.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 2つのiframeタグが生成されることを確認
      const iframeCount = (result.match(/<iframe/g) || []).length
      expect(iframeCount).toBe(2)

      // 両方のURLが変換されていることを確認
      expect(result).toContain('url=https%3A%2F%2Fexample.com')
      expect(result).toContain('url=https%3A%2F%2Ftest.com')
    })

    it('should return original HTML when urls array is empty', () => {
      const html = '<p>https://example.com</p>'
      const urls: string[] = []
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toBe(html)
    })

    it('should return original HTML when html is empty', () => {
      const html = ''
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toBe('')
    })

    it('should preserve other HTML content', () => {
      const html = '<h1>Title</h1><p>https://example.com</p><p>Some text</p>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 他のコンテンツが保持されていることを確認
      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<p>Some text</p>')
    })

    it('should handle URLs with special regex characters', () => {
      const html = '<p>https://example.com/path(with)special[chars]</p>'
      const urls = ['https://example.com/path(with)special[chars]']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).not.toContain('<p>https://example.com/path(with)special[chars]</p>')
    })

    it('should handle <p> tags with attributes', () => {
      const html = '<p class="url-paragraph" id="link-1">https://example.com</p>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).not.toContain('<p class="url-paragraph" id="link-1">https://example.com</p>')
    })

    it('should handle duplicate URLs in HTML', () => {
      const html = '<p>https://example.com</p><p>https://example.com</p>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 両方の出現箇所が変換されることを確認
      const iframeCount = (result.match(/<iframe/g) || []).length
      expect(iframeCount).toBe(2)
    })

    it('should handle URLs with fragments', () => {
      const html = '<p>https://example.com/page#section</p>'
      const urls = ['https://example.com/page#section']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fpage%23section')
    })

    it('should handle URLs with port numbers', () => {
      const html = '<p>https://example.com:8080/path</p>'
      const urls = ['https://example.com:8080/path']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=https%3A%2F%2Fexample.com%3A8080%2Fpath')
    })
  })

  describe('エラー条件のテスト', () => {
    it('should skip invalid URL without protocol', () => {
      const html = '<p>example.com</p>'
      const urls = ['example.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip URL with spaces', () => {
      const html = '<p>https://example.com/path with spaces</p>'
      const urls = ['https://example.com/path with spaces']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip URL with newline characters', () => {
      const html = '<p>https://example.com/path\nwith\nnewlines</p>'
      const urls = ['https://example.com/path\nwith\nnewlines']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip URL with tab characters', () => {
      const html = '<p>https://example.com/path\twith\ttabs</p>'
      const urls = ['https://example.com/path\twith\ttabs']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip empty string URL', () => {
      const html = '<p></p>'
      const urls = ['']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip whitespace-only URL', () => {
      const html = '<p>   </p>'
      const urls = ['   ']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip URL without hostname', () => {
      const html = '<p>https://</p>'
      const urls = ['https://']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should skip malformed URL and continue with valid URLs', () => {
      const html = '<p>https://example.com</p><p>invalid url</p><p>https://test.com</p>'
      const urls = ['https://example.com', 'invalid url', 'https://test.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 有効なURLは変換されることを確認
      expect(result).toContain('url=https%3A%2F%2Fexample.com')
      expect(result).toContain('url=https%3A%2F%2Ftest.com')

      // 不正なURLは保持されることを確認
      expect(result).toContain('<p>invalid url</p>')

      // 2つのiframeタグが生成されることを確認
      const iframeCount = (result.match(/<iframe/g) || []).length
      expect(iframeCount).toBe(2)
    })

    it('should handle URL with null byte character', () => {
      const html = '<p>https://example.com/path\0</p>'
      const urls = ['https://example.com/path\0']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should return original HTML when all URLs are invalid', () => {
      const html = '<p>invalid1</p><p>invalid2</p><p>invalid3</p>'
      const urls = ['invalid1', 'invalid2', 'invalid3']
      const result = transformUrlsToBlogCards(html, urls)

      // 元のHTMLが保持されることを確認
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })
  })

  describe('エッジケースのテスト', () => {
    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000)
      const url = `https://example.com/${longPath}`
      const html = `<p>${url}</p>`
      const urls = [url]
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).not.toContain(`<p>${url}</p>`)
    })

    it('should handle URLs with many query parameters', () => {
      const url = 'https://example.com/path?a=1&b=2&c=3&d=4&e=5&f=6&g=7&h=8&i=9&j=10'
      const html = `<p>${url}</p>`
      const urls = [url]
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fpath%3Fa%3D1%26b%3D2')
    })

    it('should handle URLs with international characters', () => {
      const url = 'https://example.com/日本語/パス'
      const html = `<p>${url}</p>`
      const urls = [url]
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      const encodedUrl = encodeURIComponent(url)
      expect(result).toContain(`url=${encodedUrl}`)
    })

    it('should handle URLs with encoded characters', () => {
      const url = 'https://example.com/path%20with%20spaces'
      const html = `<p>${url}</p>`
      const urls = [url]
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fpath%2520with%2520spaces')
    })

    it('should handle mixed valid and invalid URLs', () => {
      const html = `
        <p>https://example.com</p>
        <p>not a url</p>
        <p>https://test.com</p>
        <p>ftp://invalid.com</p>
        <p>https://valid.com</p>
      `
      const urls = [
        'https://example.com',
        'not a url',
        'https://test.com',
        'ftp://invalid.com',
        'https://valid.com',
      ]
      const result = transformUrlsToBlogCards(html, urls)

      // 有効なHTTPS URLのみが変換されることを確認
      expect(result).toContain('url=https%3A%2F%2Fexample.com')
      expect(result).toContain('url=https%3A%2F%2Ftest.com')
      expect(result).toContain('url=https%3A%2F%2Fvalid.com')

      // 不正なURLは保持されることを確認
      expect(result).toContain('<p>not a url</p>')
      expect(result).toContain('<p>ftp://invalid.com</p>')

      // 3つのiframeタグが生成されることを確認
      const iframeCount = (result.match(/<iframe/g) || []).length
      expect(iframeCount).toBe(3)
    })

    it('should handle HTML with no <p> tags', () => {
      const html = '<div>https://example.com</div>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      // <p>タグがないため変換されない
      expect(result).toBe(html)
      expect(result).not.toContain('<iframe')
    })

    it('should handle nested HTML structures', () => {
      const html = '<div><section><p>https://example.com</p></section></div>'
      const urls = ['https://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('<div><section>')
      expect(result).toContain('</section></div>')
    })

    it('should handle URLs at the beginning and end of HTML', () => {
      const html = '<p>https://start.com</p><div>content</div><p>https://end.com</p>'
      const urls = ['https://start.com', 'https://end.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('url=https%3A%2F%2Fstart.com')
      expect(result).toContain('url=https%3A%2F%2Fend.com')
      expect(result).toContain('<div>content</div>')

      const iframeCount = (result.match(/<iframe/g) || []).length
      expect(iframeCount).toBe(2)
    })

    it('should handle http:// URLs (not just https://)', () => {
      const html = '<p>http://example.com</p>'
      const urls = ['http://example.com']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=http%3A%2F%2Fexample.com')
    })

    it('should handle URLs with subdomains', () => {
      const html = '<p>https://blog.subdomain.example.com/post</p>'
      const urls = ['https://blog.subdomain.example.com/post']
      const result = transformUrlsToBlogCards(html, urls)

      expect(result).toContain('<iframe')
      expect(result).toContain('url=https%3A%2F%2Fblog.subdomain.example.com%2Fpost')
    })

    it('should handle URLs with authentication info (should be skipped)', () => {
      const html = '<p>https://user:pass@example.com</p>'
      const urls = ['https://user:pass@example.com']
      const result = transformUrlsToBlogCards(html, urls)

      // 認証情報を含むURLも技術的には有効なので変換される
      expect(result).toContain('<iframe')
    })
  })
})
