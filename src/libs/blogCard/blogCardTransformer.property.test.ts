/**
 * blogCardTransformerのプロパティベーステスト
 *
 * Feature: wordpress-url-to-blog-card
 *
 * このファイルは、blogCardTransformerモジュールの普遍的なプロパティを検証します。
 * fast-checkを使用してランダムな入力を生成し、すべての有効な実行において
 * 真であるべき特性を検証します。
 */

import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { transformUrlsToBlogCards } from './blogCardTransformer'

describe('blogCardTransformer - Property-Based Tests', () => {
  describe('プロパティ 4: URLからiframeへの変換', () => {
    it('should replace original URL string with iframe tag', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換
       * 任意の有効なURL文字列において、Blog_Card_Transformerは元のURL文字列を
       * iframeタグに置換する
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          // <p>タグ内にURLを配置
          const html = `<p>${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // 元のURL文字列が含まれないことを検証（置換されている）
          expect(result).not.toContain(`<p>${url}</p>`)

          // iframeタグが含まれることを検証
          expect(result).toContain('<iframe')
          expect(result).toContain('</iframe>')
        }),
        { numRuns: 100 },
      )
    })

    it('should transform URL to iframe with correct OGP service endpoint', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（OGPサービスエンドポイント）
       * 変換されたiframeタグは、OGP Serviceの正しいエンドポイントを参照する
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          const html = `<p>${url}</p>`
          const urls = [url]

          const result = transformUrlsToBlogCards(html, urls)

          // OGP Serviceのエンドポイントが含まれることを検証
          expect(result).toContain(
            'https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=',
          )
        }),
        { numRuns: 100 },
      )
    })

    it('should transform multiple URLs to individual iframe tags', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（複数URL）
       * 複数のURLが含まれる場合、それぞれのURLが個別のiframeタグに変換される
       */
      fc.assert(
        fc.property(fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }), (urls) => {
          // 重複を除去（reduce + Mapパターン）
          const uniqueUrls = Array.from(
            urls
              .reduce((map, url) => {
                map.set(url, url) // 最後の結果で上書き
                return map
              }, new Map<string, string>())
              .values(),
          )

          // 各URLを<p>タグで囲む
          const html = uniqueUrls.map((url) => `<p>${url}</p>`).join('\n')

          // URLを変換
          const result = transformUrlsToBlogCards(html, uniqueUrls)

          // すべての元のURL文字列が含まれないことを検証
          for (const url of uniqueUrls) {
            expect(result).not.toContain(`<p>${url}</p>`)
          }

          // iframeタグの数が期待される数と一致することを検証
          const iframeCount = (result.match(/<iframe/g) || []).length
          expect(iframeCount).toBe(uniqueUrls.length)
        }),
        { numRuns: 100 },
      )
    })

    it('should preserve other HTML content when transforming URLs', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（他のコンテンツ保持）
       * URL変換時に、他のHTMLコンテンツは変更されずに保持される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          (url, beforeText, afterText) => {
            // URLの前後にコンテンツを配置
            const html = `<h1>${beforeText}</h1><p>${url}</p><p>${afterText}</p>`
            const urls = [url]

            // URLを変換
            const result = transformUrlsToBlogCards(html, urls)

            // 他のコンテンツが保持されることを検証
            expect(result).toContain(`<h1>${beforeText}</h1>`)
            expect(result).toContain(`<p>${afterText}</p>`)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle URLs with special characters', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（特殊文字）
       * URLに特殊文字（クエリパラメータ、フラグメントなど）が含まれていても、
       * 正しく変換される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string(),
          fc.string(),
          (baseUrl, queryParam, fragment) => {
            // クエリパラメータとフラグメントを含むURLを生成
            const url = `${baseUrl}?${queryParam}#${fragment}`
            const html = `<p>${url}</p>`
            const urls = [url]

            // URLを変換
            const result = transformUrlsToBlogCards(html, urls)

            // 元のURL文字列が含まれないことを検証
            expect(result).not.toContain(`<p>${url}</p>`)

            // iframeタグが含まれることを検証
            expect(result).toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should return original HTML when urls array is empty', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（空配列）
       * URLの配列が空の場合、元のHTMLをそのまま返す
       */
      fc.assert(
        fc.property(fc.string(), (htmlContent) => {
          const html = `<p>${htmlContent}</p>`
          const urls: string[] = []

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // 元のHTMLがそのまま返されることを検証
          expect(result).toBe(html)
        }),
        { numRuns: 100 },
      )
    })

    it('should return original HTML when html is empty', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（空HTML）
       * HTML文字列が空の場合、空文字列を返す
       */
      fc.assert(
        fc.property(fc.array(fc.webUrl()), (urls) => {
          const html = ''

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // 空文字列が返されることを検証
          expect(result).toBe('')
        }),
        { numRuns: 100 },
      )
    })

    it('should handle URLs with attributes in <p> tags', () => {
      /**
       * **Validates: Requirements 2.1**
       *
       * Property 4: URLからiframeへの変換（属性付き<p>タグ）
       * <p>タグに属性（class, id, styleなど）が含まれていても、
       * URLは正しく変換される
       */
      fc.assert(
        fc.property(fc.webUrl(), fc.stringMatching(/^[a-zA-Z0-9_-]+$/), (url, className) => {
          // 属性付きの<p>タグ内にURLを配置
          const html = `<p class="${className}">${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // 元のURL文字列が含まれないことを検証
          expect(result).not.toContain(`<p class="${className}">${url}</p>`)

          // iframeタグが含まれることを検証
          expect(result).toContain('<iframe')
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('プロパティ 5: iframeタグの正しい生成', () => {
    it('should correctly escape URL using encodeURIComponent', () => {
      /**
       * **Validates: Requirements 2.2**
       *
       * Property 5: iframeタグの正しい生成（URLエスケープ）
       * 任意のURL文字列において、Blog_Card_Transformerが生成するiframeタグは
       * URLが正しくエスケープされている（encodeURIComponent）
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          const html = `<p>${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // エスケープされたURLが含まれることを検証
          const encodedUrl = encodeURIComponent(url)
          expect(result).toContain(`url=${encodedUrl}`)
        }),
        { numRuns: 100 },
      )
    })

    it('should include loading="lazy" attribute in iframe tag', () => {
      /**
       * **Validates: Requirements 2.3**
       *
       * Property 5: iframeタグの正しい生成（loading="lazy"属性）
       * 任意のURL文字列において、Blog_Card_Transformerが生成するiframeタグは
       * loading="lazy"属性が含まれている
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          const html = `<p>${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // loading="lazy"属性が含まれることを検証
          expect(result).toContain('loading="lazy"')
        }),
        { numRuns: 100 },
      )
    })

    it('should reference correct OGP Service endpoint', () => {
      /**
       * **Validates: Requirements 2.4**
       *
       * Property 5: iframeタグの正しい生成（OGPサービスエンドポイント）
       * 任意のURL文字列において、Blog_Card_Transformerが生成するiframeタグは
       * OGP Serviceの正しいエンドポイント（/card?url={encodedUrl}）を参照している
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          const html = `<p>${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // OGP Serviceのエンドポイントが含まれることを検証
          expect(result).toContain(
            'https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=',
          )

          // エスケープされたURLがエンドポイントに含まれることを検証
          const encodedUrl = encodeURIComponent(url)
          expect(result).toContain(`/card?url=${encodedUrl}`)
        }),
        { numRuns: 100 },
      )
    })

    it('should generate iframe with all required attributes', () => {
      /**
       * **Validates: Requirements 2.2, 2.3, 2.4**
       *
       * Property 5: iframeタグの正しい生成（すべての必須属性）
       * 任意のURL文字列において、Blog_Card_Transformerが生成するiframeタグは
       * すべての必須属性（src, width, height, frameborder, loading, style）を含む
       */
      fc.assert(
        fc.property(fc.webUrl(), (url) => {
          const html = `<p>${url}</p>`
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // すべての必須属性が含まれることを検証
          expect(result).toContain('<iframe')
          expect(result).toContain('src="')
          expect(result).toContain('width="100%"')
          expect(result).toContain('height="155"')
          expect(result).toContain('frameborder="0"')
          expect(result).toContain('loading="lazy"')
          expect(result).toContain('style="')
          expect(result).toContain('</iframe>')
        }),
        { numRuns: 100 },
      )
    })

    it('should correctly escape URLs with special characters', () => {
      /**
       * **Validates: Requirements 2.2**
       *
       * Property 5: iframeタグの正しい生成（特殊文字のエスケープ）
       * URLに特殊文字（&, =, ?, #など）が含まれる場合でも、
       * 正しくエスケープされる
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (baseUrl, param, value) => {
            // クエリパラメータを含むURLを生成
            const url = `${baseUrl}?${param}=${value}`
            const html = `<p>${url}</p>`
            const urls = [url]

            // URLを変換
            const result = transformUrlsToBlogCards(html, urls)

            // エスケープされたURLが含まれることを検証
            const encodedUrl = encodeURIComponent(url)
            expect(result).toContain(`url=${encodedUrl}`)

            // 元のURL（エスケープされていない）がsrc属性に直接含まれないことを検証
            // （エスケープされたバージョンのみが含まれるべき）
            const iframeMatch = result.match(/<iframe[^>]*src="([^"]*)"/)
            if (iframeMatch) {
              const srcValue = iframeMatch[1]
              // src属性内のURLパラメータ部分を取得
              const urlParamMatch = srcValue.match(/url=([^&]*)/)
              if (urlParamMatch) {
                const urlParam = urlParamMatch[1]
                // URLパラメータがエスケープされていることを検証
                expect(urlParam).toBe(encodedUrl)
              }
            }
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should maintain consistent iframe structure across different URLs', () => {
      /**
       * **Validates: Requirements 2.2, 2.3, 2.4**
       *
       * Property 5: iframeタグの正しい生成（一貫性）
       * 異なるURLに対しても、iframeタグの構造は一貫している
       * （src属性のURL部分のみが異なる）
       */
      fc.assert(
        fc.property(fc.array(fc.webUrl(), { minLength: 2, maxLength: 5 }), (urls) => {
          // 重複を除去（reduce + Mapパターン）
          const uniqueUrls = Array.from(
            urls
              .reduce((map, url) => {
                map.set(url, url)
                return map
              }, new Map<string, string>())
              .values(),
          )

          // 少なくとも2つのユニークなURLが必要
          if (uniqueUrls.length < 2) return

          // 各URLを個別に変換
          const results = uniqueUrls.map((url) => {
            const html = `<p>${url}</p>`
            return transformUrlsToBlogCards(html, [url])
          })

          // すべての結果でloading="lazy"が含まれることを検証
          for (const result of results) {
            expect(result).toContain('loading="lazy"')
          }

          // すべての結果でOGPサービスエンドポイントが含まれることを検証
          for (const result of results) {
            expect(result).toContain(
              'https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=',
            )
          }

          // すべての結果で同じ属性セットが含まれることを検証
          for (const result of results) {
            expect(result).toContain('width="100%"')
            expect(result).toContain('height="155"')
            expect(result).toContain('frameborder="0"')
          }
        }),
        { numRuns: 100 },
      )
    })
  })
})
