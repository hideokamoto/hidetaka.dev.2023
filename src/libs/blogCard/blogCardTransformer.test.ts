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
  })
})
