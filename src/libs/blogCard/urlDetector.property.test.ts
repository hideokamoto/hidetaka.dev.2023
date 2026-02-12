/**
 * urlDetectorのプロパティベーステスト
 * 
 * Feature: wordpress-url-to-blog-card
 * 
 * このファイルは、urlDetectorモジュールの普遍的なプロパティを検証します。
 * fast-checkを使用してランダムな入力を生成し、すべての有効な実行において
 * 真であるべき特性を検証します。
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { detectIndependentUrls } from './urlDetector'

describe('urlDetector - Property-Based Tests', () => {
  describe('プロパティ 1: 独立したURLの検出', () => {
    it('should detect independent URLs in <p> tags', () => {
      /**
       * **Validates: Requirements 1.1**
       * 
       * Property 1: 独立したURLの検出
       * 任意のHTML文字列において、<p>タグ内に含まれるHTTP/HTTPSで始まるURLは、
       * URL_Detectorによって検出される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          (url) => {
            // <p>タグ内に独立したURLを配置
            const html = `<p>${url}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 検出されたURLに含まれることを検証
            expect(detected).toContain(url)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect multiple independent URLs in separate <p> tags', () => {
      /**
       * **Validates: Requirements 1.1**
       * 
       * Property 1: 独立したURLの検出（複数URL）
       * 任意の複数のHTML文字列において、それぞれの<p>タグ内に含まれる
       * HTTP/HTTPSで始まるURLは、除外条件に該当しない限り、
       * すべてURL_Detectorによって検出される
       */
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
          (urls) => {
            // 重複を除去（reduce + Mapパターン）
            const uniqueUrls = Array.from(
              urls.reduce((map, url) => {
                map.set(url, url) // 最後の結果で上書き
                return map
              }, new Map<string, string>()).values()
            )
            
            // 除外条件を適用（画像URL、自サイトURL）
            const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
            const ownSitePattern = /hidetaka\.dev/i
            
            const expectedUrls = uniqueUrls.filter(url => {
              return !imageExtensions.test(url) && !ownSitePattern.test(url)
            })
            
            // 各URLを<p>タグで囲む
            const html = uniqueUrls.map(url => `<p>${url}</p>`).join('\n')
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 除外条件に該当しないURLがすべて検出されることを検証
            for (const url of expectedUrls) {
              expect(detected).toContain(url)
            }
            
            // 検出されたURLの数が期待される数と一致することを検証
            expect(detected.length).toBe(expectedUrls.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect URLs with various attributes in <p> tags', () => {
      /**
       * **Validates: Requirements 1.1**
       * 
       * Property 1: 独立したURLの検出（属性付き<p>タグ）
       * <p>タグに属性（class, id, styleなど）が含まれていても、
       * タグ内のURLは正しく検出される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
          (url, className) => {
            // 属性付きの<p>タグ内にURLを配置
            // classNameは有効なHTML属性値（英数字、ハイフン、アンダースコアのみ）
            const html = `<p class="${className}">${url}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 検出されたURLに含まれることを検証
            expect(detected).toContain(url)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty HTML strings', () => {
      /**
       * **Validates: Requirements 1.1**
       * 
       * Property 1: 独立したURLの検出（空文字列）
       * 空のHTML文字列の場合、空配列を返す
       */
      const html = ''
      const detected = detectIndependentUrls(html)
      expect(detected).toEqual([])
    })

    it('should handle HTML without URLs', () => {
      /**
       * **Validates: Requirements 1.1**
       * 
       * Property 1: 独立したURLの検出（URLなし）
       * URLを含まないHTML文字列の場合、空配列を返す
       */
      fc.assert(
        fc.property(
          fc.string(),
          (text) => {
            // URLを含まない<p>タグ
            const html = `<p>${text}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // textがURLでない場合、空配列を返すことを検証
            // （fast-checkのstringはランダムな文字列を生成するため、
            // URLパターンに一致しない可能性が高い）
            if (!text.match(/^https?:\/\//)) {
              expect(detected).toEqual([])
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('プロパティ 2: 除外条件の適用', () => {
    it('should not detect URLs inside <a> tags', () => {
      /**
       * **Validates: Requirements 1.2**
       * 
       * Property 2: 除外条件の適用（リンクタグ）
       * 任意のHTML文字列において、リンクタグ（<a href="...">）内のURLは、
       * URL_Detectorによって検出されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string(),
          (url, linkText) => {
            // リンクタグ内にURLを配置
            const html = `<a href="${url}">${linkText}</a>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // リンクタグ内のURLは検出されないことを検証
            expect(detected).not.toContain(url)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect URLs inside <a> tags even when also in <p> tags', () => {
      /**
       * **Validates: Requirements 1.2**
       * 
       * Property 2: 除外条件の適用（リンクタグと独立URL）
       * 同じURLがリンクタグ内と<p>タグ内の両方に存在する場合、
       * リンクタグ内のURLは除外され、<p>タグ内のURLも検出されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string().filter(s => !s.includes('"') && !s.includes("'")),
          (url, linkText) => {
            // URLに引用符が含まれる場合はスキップ（HTML属性値として不正）
            if (url.includes('"') || url.includes("'")) {
              return true
            }
            
            // リンクタグと<p>タグの両方にURLを配置
            const html = `<a href="${url}">${linkText}</a><p>${url}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // リンクタグ内のURLは除外されるため、<p>タグ内のURLも検出されない
            expect(detected).not.toContain(url)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect image URLs', () => {
      /**
       * **Validates: Requirements 1.3**
       * 
       * Property 2: 除外条件の適用（画像URL）
       * 任意のHTML文字列において、画像拡張子（.jpg, .png, .gif, .webp, .svg）を
       * 持つURLは、URL_Detectorによって検出されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'),
          (baseUrl, extension) => {
            // 画像URLを生成
            const imageUrl = `${baseUrl}${extension}`
            
            // <p>タグ内に画像URLを配置
            const html = `<p>${imageUrl}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 画像URLは検出されないことを検証
            expect(detected).not.toContain(imageUrl)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect image URLs with query parameters', () => {
      /**
       * **Validates: Requirements 1.3**
       * 
       * Property 2: 除外条件の適用（クエリパラメータ付き画像URL）
       * 画像URLにクエリパラメータが含まれていても、画像拡張子を持つURLは
       * 検出されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'),
          fc.string(),
          (baseUrl, extension, queryParam) => {
            // クエリパラメータ付き画像URLを生成
            const imageUrl = `${baseUrl}${extension}?${queryParam}`
            
            // <p>タグ内に画像URLを配置
            const html = `<p>${imageUrl}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 画像URLは検出されないことを検証
            expect(detected).not.toContain(imageUrl)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect own site URLs (hidetaka.dev)', () => {
      /**
       * **Validates: Requirements 1.4**
       * 
       * Property 2: 除外条件の適用（自サイトURL）
       * 任意のHTML文字列において、自サイトドメイン（hidetaka.dev）を含むURLは、
       * URL_Detectorによって検出されない
       */
      fc.assert(
        fc.property(
          fc.constantFrom('http', 'https'),
          fc.string(),
          (protocol, path) => {
            // 自サイトURLを生成
            const ownSiteUrl = `${protocol}://hidetaka.dev/${path}`
            
            // <p>タグ内に自サイトURLを配置
            const html = `<p>${ownSiteUrl}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 自サイトURLは検出されないことを検証
            expect(detected).not.toContain(ownSiteUrl)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect own site URLs with subdomains', () => {
      /**
       * **Validates: Requirements 1.4**
       * 
       * Property 2: 除外条件の適用（サブドメイン付き自サイトURL）
       * サブドメインを含む自サイトURL（例: www.hidetaka.dev）も検出されない
       */
      fc.assert(
        fc.property(
          fc.constantFrom('http', 'https'),
          fc.string(),
          fc.string(),
          (protocol, subdomain, path) => {
            // サブドメイン付き自サイトURLを生成
            const ownSiteUrl = `${protocol}://${subdomain}.hidetaka.dev/${path}`
            
            // <p>タグ内に自サイトURLを配置
            const html = `<p>${ownSiteUrl}</p>`
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // 自サイトURLは検出されないことを検証
            expect(detected).not.toContain(ownSiteUrl)
            expect(detected).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply all exclusion conditions correctly', () => {
      /**
       * **Validates: Requirements 1.2, 1.3, 1.4**
       * 
       * Property 2: 除外条件の適用（複合）
       * 複数の除外条件が混在する場合でも、すべての除外条件が正しく適用される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.webUrl(),
          fc.webUrl(),
          fc.string(),
          (validUrl, linkUrl, imageUrl, linkText) => {
            // 画像拡張子を追加
            const imageUrlWithExt = `${imageUrl}.jpg`
            
            // 自サイトURL
            const ownSiteUrl = 'https://hidetaka.dev/blog/post'
            
            // 複数の条件を含むHTML
            const html = `
              <p>${validUrl}</p>
              <a href="${linkUrl}">${linkText}</a>
              <p>${imageUrlWithExt}</p>
              <p>${ownSiteUrl}</p>
            `
            
            // URLを検出
            const detected = detectIndependentUrls(html)
            
            // validUrlのみが検出されることを検証
            expect(detected).toContain(validUrl)
            expect(detected).not.toContain(linkUrl)
            expect(detected).not.toContain(imageUrlWithExt)
            expect(detected).not.toContain(ownSiteUrl)
            expect(detected.length).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
