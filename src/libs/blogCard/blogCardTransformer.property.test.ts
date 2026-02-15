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
import { transformUrlsToBlogCards } from '@/libs/blogCard/blogCardTransformer'

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
          expect(result).toContain('https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=')
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
          fc.string().filter((s) => !s.includes(' ') && !s.includes('\t') && !s.includes('\n')),
          fc.string().filter((s) => !s.includes(' ') && !s.includes('\t') && !s.includes('\n')),
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

  describe('プロパティ 6: 複数URLの個別変換', () => {
    it('should transform each URL to individual iframe tags', () => {
      /**
       * **Validates: Requirements 2.5**
       *
       * Property 6: 複数URLの個別変換
       * 任意のHTML文字列において、複数のURLが検出される場合、
       * Blog_Card_TransformerはそれぞれのURLを個別のiframeタグに変換し、
       * すべての変換が完了する
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

          // 各URLを<p>タグで囲んでHTMLを生成
          const html = uniqueUrls.map((url) => `<p>${url}</p>`).join('\n')

          // URLを変換
          const result = transformUrlsToBlogCards(html, uniqueUrls)

          // すべてのURLが個別のiframeタグに変換されることを検証
          const iframeCount = (result.match(/<iframe/g) || []).length
          expect(iframeCount).toBe(uniqueUrls.length)

          // 各URLに対応するiframeが存在することを検証
          for (const url of uniqueUrls) {
            const encodedUrl = encodeURIComponent(url)
            expect(result).toContain(`url=${encodedUrl}`)
          }

          // 元のURL文字列が含まれないことを検証（すべて置換されている）
          for (const url of uniqueUrls) {
            expect(result).not.toContain(`<p>${url}</p>`)
          }
        }),
        { numRuns: 100 },
      )
    })

    it('should complete all transformations for multiple URLs', () => {
      /**
       * **Validates: Requirements 2.5**
       *
       * Property 6: 複数URLの個別変換（完全性）
       * 複数のURLが含まれる場合、すべての変換が完了し、
       * 変換されていないURLが残らない
       */
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 2, maxLength: 5 }),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          (urls, additionalContent) => {
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

            // URLと追加コンテンツを混在させたHTMLを生成
            const htmlParts = uniqueUrls.map((url) => `<p>${url}</p>`)
            htmlParts.push(`<p>${additionalContent}</p>`)
            const html = htmlParts.join('\n')

            // URLを変換
            const result = transformUrlsToBlogCards(html, uniqueUrls)

            // すべてのURLが変換されていることを検証
            for (const url of uniqueUrls) {
              // 元のURL文字列が含まれないことを検証
              expect(result).not.toContain(`<p>${url}</p>`)

              // 対応するiframeが存在することを検証
              const encodedUrl = encodeURIComponent(url)
              expect(result).toContain(`url=${encodedUrl}`)
            }

            // 追加コンテンツは保持されることを検証
            expect(result).toContain(`<p>${additionalContent}</p>`)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle duplicate URLs in HTML correctly', () => {
      /**
       * **Validates: Requirements 2.5**
       *
       * Property 6: 複数URLの個別変換（重複URL）
       * HTML内に同じURLが複数回出現する場合でも、
       * すべての出現箇所が個別のiframeタグに変換される
       */
      fc.assert(
        fc.property(fc.webUrl(), fc.integer({ min: 2, max: 5 }), (url, duplicateCount) => {
          // 同じURLを複数回含むHTMLを生成
          const html = Array(duplicateCount)
            .fill(null)
            .map(() => `<p>${url}</p>`)
            .join('\n')

          // URLリストには1つだけ含める（重複除去済み）
          const urls = [url]

          // URLを変換
          const result = transformUrlsToBlogCards(html, urls)

          // すべての出現箇所が変換されることを検証
          const iframeCount = (result.match(/<iframe/g) || []).length
          expect(iframeCount).toBe(duplicateCount)

          // 元のURL文字列が含まれないことを検証
          expect(result).not.toContain(`<p>${url}</p>`)
        }),
        { numRuns: 100 },
      )
    })

    it('should preserve order of URLs in transformation', () => {
      /**
       * **Validates: Requirements 2.5**
       *
       * Property 6: 複数URLの個別変換（順序保持）
       * 複数のURLを変換する際、元のHTML内での順序が保持される
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

          // 各URLを<p>タグで囲んでHTMLを生成
          const html = uniqueUrls.map((url) => `<p>${url}</p>`).join('\n')

          // URLを変換
          const result = transformUrlsToBlogCards(html, uniqueUrls)

          // 各URLのiframeの位置を取得
          const iframePositions = uniqueUrls.map((url) => {
            const encodedUrl = encodeURIComponent(url)
            const pattern = new RegExp(`url=${encodedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
            const match = result.match(pattern)
            return match ? result.indexOf(match[0]) : -1
          })

          // すべてのiframeが見つかることを検証
          for (const position of iframePositions) {
            expect(position).toBeGreaterThanOrEqual(0)
          }

          // 順序が保持されることを検証（位置が昇順）
          Array.from(iframePositions.entries()).forEach(([i, pos]) => {
            if (i > 0) {
              expect(pos).toBeGreaterThan(iframePositions[i - 1])
            }
          })
        }),
        { numRuns: 100 },
      )
    })

    it('should handle mixed content with multiple URLs', () => {
      /**
       * **Validates: Requirements 2.5**
       *
       * Property 6: 複数URLの個別変換（混在コンテンツ）
       * URLと他のHTMLコンテンツが混在している場合でも、
       * すべてのURLが正しく変換され、他のコンテンツは保持される
       */
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
          fc.array(
            fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
            {
              minLength: 1,
              maxLength: 5,
            },
          ),
          (urls, textContents) => {
            // 重複を除去（reduce + Mapパターン）
            const uniqueUrls = Array.from(
              urls
                .reduce((map, url) => {
                  map.set(url, url)
                  return map
                }, new Map<string, string>())
                .values(),
            )

            // URLとテキストコンテンツを交互に配置
            const htmlParts: string[] = []
            const maxLength = Math.max(uniqueUrls.length, textContents.length)

            Array.from({ length: maxLength }).forEach((_, i) => {
              if (i < textContents.length) {
                htmlParts.push(`<p>${textContents[i]}</p>`)
              }
              if (i < uniqueUrls.length) {
                htmlParts.push(`<p>${uniqueUrls[i]}</p>`)
              }
            })

            const html = htmlParts.join('\n')

            // URLを変換
            const result = transformUrlsToBlogCards(html, uniqueUrls)

            // すべてのURLが変換されることを検証
            for (const url of uniqueUrls) {
              expect(result).not.toContain(`<p>${url}</p>`)
              const encodedUrl = encodeURIComponent(url)
              expect(result).toContain(`url=${encodedUrl}`)
            }

            // テキストコンテンツが保持されることを検証
            for (const text of textContents) {
              expect(result).toContain(`<p>${text}</p>`)
            }
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('プロパティ 7: 不正なURLのスキップ', () => {
    it('should skip invalid URLs without protocol and preserve original HTML', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ
       * 任意の不正なURL（プロトコルなし、不正な形式など）において、
       * Blog_Card_TransformerはそのURLを変換せずにスキップし、
       * 元のHTML文字列を保持する
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }).filter((s) => !s.startsWith('http')),
          (invalidUrl) => {
            // プロトコルなしのURLを含むHTML
            const html = `<p>${invalidUrl}</p>`
            const urls = [invalidUrl]

            // URLを変換（不正なURLはスキップされるべき）
            const result = transformUrlsToBlogCards(html, urls)

            // 元のHTMLが保持されることを検証（変換されない）
            expect(result).toBe(html)

            // iframeタグが生成されないことを検証
            expect(result).not.toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should skip malformed URLs and preserve original HTML', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ（不正な形式）
       * 不正な形式のURL（スペース、制御文字など）を含む場合、
       * そのURLをスキップし、元のHTMLを保持する
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.includes(' ')),
          (malformedUrl) => {
            // スペースを含む不正なURLを含むHTML
            const html = `<p>https://${malformedUrl}</p>`
            const urls = [`https://${malformedUrl}`]

            // URLを変換
            const result = transformUrlsToBlogCards(html, urls)

            // 元のHTMLが保持されることを検証
            expect(result).toBe(html)

            // iframeタグが生成されないことを検証
            expect(result).not.toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should skip invalid URLs and continue transforming valid URLs', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ（混在）
       * 有効なURLと不正なURLが混在する場合、
       * 不正なURLはスキップし、有効なURLのみを変換する
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string({ minLength: 5, maxLength: 30 }).filter((s) => !s.startsWith('http')),
          (validUrl, invalidUrl) => {
            // 有効なURLと不正なURLを含むHTML
            const html = `<p>${validUrl}</p>\n<p>${invalidUrl}</p>`
            const urls = [validUrl, invalidUrl]

            // URLを変換
            const result = transformUrlsToBlogCards(html, urls)

            // 有効なURLは変換されることを検証
            expect(result).not.toContain(`<p>${validUrl}</p>`)
            expect(result).toContain('<iframe')

            // 不正なURLは保持されることを検証
            expect(result).toContain(`<p>${invalidUrl}</p>`)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle empty or null-like URLs gracefully', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ（空URL）
       * 空文字列やnull的な値を含むURLリストを処理する際、
       * エラーを発生させずに処理を継続する
       */
      fc.assert(
        fc.property(fc.webUrl(), (validUrl) => {
          // 有効なURLと空文字列を含むHTML
          const html = `<p>${validUrl}</p>\n<p></p>`
          const urls = [validUrl, '']

          // URLを変換（エラーが発生しないことを検証）
          const result = transformUrlsToBlogCards(html, urls)

          // 有効なURLは変換されることを検証
          expect(result).not.toContain(`<p>${validUrl}</p>`)
          expect(result).toContain('<iframe')

          // 空の<p>タグは保持されることを検証
          expect(result).toContain('<p></p>')
        }),
        { numRuns: 100 },
      )
    })

    it('should preserve original HTML when all URLs are invalid', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ（すべて不正）
       * すべてのURLが不正な場合、元のHTMLをそのまま返す
       */
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 5, maxLength: 30 }).filter((s) => !s.startsWith('http')),
            { minLength: 1, maxLength: 5 },
          ),
          (invalidUrls) => {
            // 重複を除去（reduce + Mapパターン）
            const uniqueUrls = Array.from(
              invalidUrls
                .reduce((map, url) => {
                  map.set(url, url)
                  return map
                }, new Map<string, string>())
                .values(),
            )

            // すべて不正なURLを含むHTML
            const html = uniqueUrls.map((url) => `<p>${url}</p>`).join('\n')

            // URLを変換
            const result = transformUrlsToBlogCards(html, uniqueUrls)

            // 元のHTMLが保持されることを検証
            expect(result).toBe(html)

            // iframeタグが生成されないことを検証
            expect(result).not.toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle URLs with invalid characters gracefully', () => {
      /**
       * **Validates: Requirements 5.4**
       *
       * Property 7: 不正なURLのスキップ（不正な文字）
       * 不正な文字（制御文字、改行など）を含むURLを処理する際、
       * エラーを発生させずにスキップする
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('\n', '\r', '\t', '\0'),
          (validUrl, invalidChar) => {
            // 不正な文字を含むURL
            const invalidUrl = `${validUrl}${invalidChar}`
            const html = `<p>${validUrl}</p>\n<p>${invalidUrl}</p>`
            const urls = [validUrl, invalidUrl]

            // URLを変換（エラーが発生しないことを検証）
            const result = transformUrlsToBlogCards(html, urls)

            // 有効なURLは変換されることを検証
            expect(result).not.toContain(`<p>${validUrl}</p>`)
            expect(result).toContain('<iframe')

            // 不正なURLを含む部分は保持されることを検証
            expect(result).toContain(invalidUrl)
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('プロパティ 9: ラウンドトリップ一貫性', () => {
    it('should preserve original content except transformed URLs', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性
       * 任意のHTML文字列において、変換処理を実行した後、
       * 変換されたiframeタグを除く元のコンテンツは変更されない
       */
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
          fc.array(
            fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
            { minLength: 1, maxLength: 5 },
          ),
          (urls, textContents) => {
            // 重複を除去（reduce + Mapパターン）
            const uniqueUrls = Array.from(
              urls
                .reduce((map, url) => {
                  map.set(url, url)
                  return map
                }, new Map<string, string>())
                .values(),
            )

            // URLとテキストコンテンツを混在させたHTMLを生成
            // 各URLに対応する<p>タグを確実に生成
            const htmlParts: string[] = []
            const maxLength = Math.max(uniqueUrls.length, textContents.length)

            Array.from({ length: maxLength }).forEach((_, i) => {
              if (i < textContents.length) {
                htmlParts.push(`<p>${textContents[i]}</p>`)
              }
              if (i < uniqueUrls.length) {
                htmlParts.push(`<p>${uniqueUrls[i]}</p>`)
              }
            })
            const html = htmlParts.join('\n')

            // URLを変換
            const result = transformUrlsToBlogCards(html, uniqueUrls)

            // 元のテキストコンテンツがすべて保持されることを検証
            for (const text of textContents) {
              expect(result).toContain(`<p>${text}</p>`)
            }

            // URLは変換されていることを検証（元のURL文字列は含まれない）
            for (const url of uniqueUrls) {
              expect(result).not.toContain(`<p>${url}</p>`)
            }

            // iframeタグが生成されていることを検証
            const iframeCount = (result.match(/<iframe/g) || []).length
            expect(iframeCount).toBe(uniqueUrls.length)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should preserve HTML structure and attributes of non-URL elements', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性（HTML構造保持）
       * URL以外のHTML要素の構造と属性は変更されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          (url, className, headingText) => {
            // 複雑なHTML構造を生成
            const html = `<div class="${className}">
  <h1>${headingText}</h1>
  <p>${url}</p>
  <p>Additional content</p>
</div>`

            // URLを変換
            const result = transformUrlsToBlogCards(html, [url])

            // div要素とその属性が保持されることを検証
            expect(result).toContain(`<div class="${className}">`)
            expect(result).toContain('</div>')

            // h1要素とその内容が保持されることを検証
            expect(result).toContain(`<h1>${headingText}</h1>`)

            // 追加コンテンツが保持されることを検証
            expect(result).toContain('<p>Additional content</p>')

            // URLは変換されていることを検証
            expect(result).not.toContain(`<p>${url}</p>`)
            expect(result).toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should preserve whitespace and formatting of non-URL content', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性（空白文字保持）
       * URL以外のコンテンツの空白文字やフォーマットは変更されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          (url, text) => {
            // 空白文字を含むHTMLを生成
            const html = `<p>  ${text}  </p>\n<p>${url}</p>\n<p>  Another paragraph  </p>`

            // URLを変換
            const result = transformUrlsToBlogCards(html, [url])

            // 空白文字が保持されることを検証
            expect(result).toContain(`<p>  ${text}  </p>`)
            expect(result).toContain('<p>  Another paragraph  </p>')

            // 改行文字が保持されることを検証（URLの前後）
            expect(result).toMatch(/\n<iframe/)
            expect(result).toMatch(/<\/iframe>\n/)

            // URLは変換されていることを検証
            expect(result).not.toContain(`<p>${url}</p>`)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should handle transformation idempotently for non-URL content', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性（冪等性）
       * 同じHTML（URL以外）に対して複数回変換を実行しても、
       * URL以外のコンテンツは常に同じ状態を保つ
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.array(
            fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
            { minLength: 2, maxLength: 5 },
          ),
          (url, textContents) => {
            // テキストコンテンツとURLを含むHTMLを生成
            const htmlParts = textContents.map((text) => `<p>${text}</p>`)
            htmlParts.push(`<p>${url}</p>`)
            const html = htmlParts.join('\n')

            // 1回目の変換
            const result1 = transformUrlsToBlogCards(html, [url])

            // 2回目の変換（既に変換済みのHTMLに対して）
            // 注: URLは既にiframeに変換されているため、urlsは空配列
            const result2 = transformUrlsToBlogCards(result1, [])

            // テキストコンテンツが両方の結果で保持されることを検証
            for (const text of textContents) {
              expect(result1).toContain(`<p>${text}</p>`)
              expect(result2).toContain(`<p>${text}</p>`)
            }

            // 2回目の変換でHTMLが変更されないことを検証
            expect(result2).toBe(result1)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should preserve nested HTML elements when transforming URLs', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性（ネストされた要素）
       * ネストされたHTML要素の構造は、URL変換後も保持される
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          fc.string().filter((s) => !s.includes('<') && !s.includes('>')),
          (url, listItem1, listItem2) => {
            // ネストされたHTML構造を生成
            const html = `<div>
  <ul>
    <li>${listItem1}</li>
    <li>${listItem2}</li>
  </ul>
  <p>${url}</p>
</div>`

            // URLを変換
            const result = transformUrlsToBlogCards(html, [url])

            // ネストされた要素が保持されることを検証
            expect(result).toContain('<div>')
            expect(result).toContain('<ul>')
            expect(result).toContain(`<li>${listItem1}</li>`)
            expect(result).toContain(`<li>${listItem2}</li>`)
            expect(result).toContain('</ul>')
            expect(result).toContain('</div>')

            // URLは変換されていることを検証
            expect(result).not.toContain(`<p>${url}</p>`)
            expect(result).toContain('<iframe')
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should preserve special HTML entities in non-URL content', () => {
      /**
       * **Validates: Requirements 2.1, 2.5**
       *
       * Property 9: ラウンドトリップ一貫性（HTMLエンティティ）
       * URL以外のコンテンツに含まれるHTMLエンティティは変更されない
       */
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom('&amp;', '&lt;', '&gt;', '&quot;', '&#39;'),
          (url, entity) => {
            // HTMLエンティティを含むコンテンツを生成
            const html = `<p>Text with ${entity} entity</p>\n<p>${url}</p>`

            // URLを変換
            const result = transformUrlsToBlogCards(html, [url])

            // HTMLエンティティが保持されることを検証
            expect(result).toContain(`<p>Text with ${entity} entity</p>`)

            // URLは変換されていることを検証
            expect(result).not.toContain(`<p>${url}</p>`)
            expect(result).toContain('<iframe')
          },
        ),
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
          expect(result).toContain('https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=')

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
          fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => !s.includes(' ') && !s.includes('\t') && !s.includes('\n')),
          fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => !s.includes(' ') && !s.includes('\t') && !s.includes('\n')),
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
            expect(result).toContain('https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=')
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
