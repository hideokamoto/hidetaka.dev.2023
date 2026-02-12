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
})
