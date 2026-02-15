/**
 * CTA (Call-to-Action) コンポーネントの型定義
 *
 * 記事タイプに基づいて適切なCTAパターンを表示するための型定義を提供します。
 */

/**
 * 記事のタイプ
 * - tutorial: 技術チュートリアル記事
 * - essay: エッセイや考察記事
 * - tool_announcement: ツールやプロジェクトの発表記事
 * - general: その他の一般記事（デフォルト）
 */
export type ArticleType = 'tutorial' | 'essay' | 'tool_announcement' | 'general'

/**
 * CTAボタンの定義
 */
export interface CTAButton {
  /** ボタンに表示するテキスト */
  text: string
  /** リンク先のURL */
  href: string
  /** ボタンのスタイルバリアント */
  variant?: 'primary' | 'secondary' | 'outline'
}

/**
 * CTAデータの構造
 */
export interface CTAData {
  /** CTAセクションの見出し */
  heading: string
  /** 説明テキスト */
  description: string
  /** アクションボタンの配列（1〜3個） */
  buttons: CTAButton[]
}

/**
 * 言語別のCTAパターン
 */
export interface CTAPattern {
  /** 日本語のCTAデータ */
  ja: CTAData
  /** 英語のCTAデータ */
  en: CTAData
}
