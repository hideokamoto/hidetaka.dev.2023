/**
 * HTMLをMarkdown形式に変換するユーティリティ関数
 * WordPressのHTML記事をMarkdownに変換する
 */

import TurndownService from 'turndown'

// Turndownインスタンスを作成（シングルトンパターン）
let turndownInstance: TurndownService | null = null

function getTurndownService(): TurndownService {
  if (!turndownInstance) {
    turndownInstance = new TurndownService({
      headingStyle: 'atx', // # スタイルの見出し
      hr: '---', // 水平線のスタイル
      bulletListMarker: '-', // 箇条書きのマーカー
      codeBlockStyle: 'fenced', // ```スタイルのコードブロック
      emDelimiter: '*', // イタリックのデリミタ
    })
  }
  return turndownInstance
}

/**
 * HTMLタグをMarkdownに変換
 */
export function htmlToMarkdown(html: string): string {
  const turndownService = getTurndownService()
  return turndownService.turndown(html)
}

/**
 * 記事のメタデータとコンテンツをMarkdown形式で整形
 */
export function formatArticleAsMarkdown(options: {
  title: string
  date: string
  categories?: Array<{ name: string }>
  content: string
  url?: string
}): string {
  const { title, date, categories, content, url } = options

  const parts: string[] = []

  // タイトル
  parts.push(`# ${title}\n`)

  // メタ情報
  const metaParts: string[] = []
  metaParts.push(`**Published:** ${new Date(date).toLocaleDateString('ja-JP')}`)

  if (categories && categories.length > 0) {
    const categoryNames = categories.map((c) => c.name).join(', ')
    metaParts.push(`**Categories:** ${categoryNames}`)
  }

  if (url) {
    metaParts.push(`**URL:** ${url}`)
  }

  parts.push(metaParts.join(' | '))
  parts.push('\n---\n')

  // 本文
  const markdownContent = htmlToMarkdown(content)
  parts.push(markdownContent)

  return parts.join('\n')
}
