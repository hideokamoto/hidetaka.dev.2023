/**
 * WordPress記事本文のURL変換システムの型定義
 */

/**
 * 検出されたURL文字列
 */
export type DetectedUrl = string

/**
 * 変換後のHTML文字列
 */
export type TransformedHtml = string

/**
 * WordPress記事オブジェクト（既存の型を参照）
 */
export interface WPThought {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  date: string
  slug: string
  link: string
  categories?: number[]
  _embedded?: {
    'wp:term'?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
}
