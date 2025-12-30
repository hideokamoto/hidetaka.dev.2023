/**
 * HTMLをMarkdown形式に変換するユーティリティ関数
 * WordPressのHTML記事をMarkdownに変換する
 */

import dayjs from 'dayjs'
import TurndownService from 'turndown'

// Turndownインスタンスをモジュールスコープで生成
const turndownService = new TurndownService({
  headingStyle: 'atx', // # スタイルの見出し
  hr: '---', // 水平線のスタイル
  bulletListMarker: '-', // 箇条書きのマーカー
  codeBlockStyle: 'fenced', // ```スタイルのコードブロック
  emDelimiter: '*', // イタリックのデリミタ
})

/**
 * HTMLタグをMarkdownに変換
 */
export function htmlToMarkdown(html: string): string {
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

  // YAML frontmatter
  const frontmatter: string[] = []
  frontmatter.push('---')
  // タイトルに特殊文字が含まれる可能性があるため、クォートで囲む
  frontmatter.push(`title: "${title.replace(/"/g, '\\"')}"`)
  frontmatter.push(`date: ${dayjs(date).format('YYYY-MM-DD')}`)

  if (categories && categories.length > 0) {
    if (categories.length === 1) {
      frontmatter.push(`categories: "${categories[0].name.replace(/"/g, '\\"')}"`)
    } else {
      frontmatter.push('categories:')
      categories.forEach((c) => {
        frontmatter.push(`  - "${c.name.replace(/"/g, '\\"')}"`)
      })
    }
  }

  if (url) {
    frontmatter.push(`url: "${url.replace(/"/g, '\\"')}"`)
  }

  frontmatter.push('---')
  parts.push(frontmatter.join('\n'))

  // 本文
  const markdownContent = htmlToMarkdown(content)
  parts.push(markdownContent)

  return parts.join('\n\n')
}
