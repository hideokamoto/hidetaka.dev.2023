import type { WPThought } from '@/libs/dataSources/types'

/**
 * HTMLをMarkdownに変換する基本的な関数
 * 完全な変換ではなく、主要なタグのみ対応
 */
export function htmlToMarkdown(html: string): string {
  let markdown = html

  // コードブロック（pre + code）
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, code) => {
      const decodedCode = decodeHtmlEntities(code)
      return `\n\`\`\`\n${decodedCode}\n\`\`\`\n`
    }
  )

  // インラインコード
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

  // 見出し（h1-h6）
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n')

  // 太字
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')

  // 斜体
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

  // リンク
  markdown = markdown.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    '[$2]($1)'
  )

  // 画像
  markdown = markdown.replace(
    /<img\s+(?:[^>]*?\s+)?src="([^"]*)"(?:[^>]*?\s+)?alt="([^"]*)"[^>]*\/?>/gi,
    '![$2]($1)'
  )
  markdown = markdown.replace(
    /<img\s+(?:[^>]*?\s+)?src="([^"]*)"[^>]*\/?>/gi,
    '![]($1)'
  )

  // 順序なしリスト
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, items) => {
    let list = items.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    return `\n${list}\n`
  })

  // 順序付きリスト
  let olCounter = 0
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, items) => {
    olCounter = 1
    let list = items.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
      return `${olCounter++}. $1\n`
    })
    return `\n${list}\n`
  })

  // 引用
  markdown = markdown.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (_, content) => {
      const lines = content.trim().split('\n')
      return '\n' + lines.map((line: string) => `> ${line}`).join('\n') + '\n'
    }
  )

  // 水平線
  markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n')

  // 改行
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')

  // 段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')

  // div（単純に改行として扱う）
  markdown = markdown.replace(/<div[^>]*>(.*?)<\/div>/gi, '\n$1\n')

  // 残りのHTMLタグを削除
  markdown = markdown.replace(/<[^>]+>/g, '')

  // HTMLエンティティをデコード
  markdown = decodeHtmlEntities(markdown)

  // 連続する改行を整理（3つ以上の改行を2つに）
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  // 前後の空白を削除
  markdown = markdown.trim()

  return markdown
}

/**
 * HTMLエンティティをデコード
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }

  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity)
}

/**
 * WordPress記事をMarkdown形式に変換
 */
export function convertThoughtToMarkdown(thought: WPThought): string {
  const frontmatter = [
    '---',
    `title: "${thought.title.rendered.replace(/"/g, '\\"')}"`,
    `date: ${thought.date}`,
    `slug: ${thought.slug}`,
  ]

  // カテゴリがある場合は追加
  if (thought._embedded?.['wp:term']) {
    const categories = thought._embedded['wp:term']
      .flat()
      .filter((term) => term.taxonomy === 'category')
      .map((cat) => cat.name)

    if (categories.length > 0) {
      frontmatter.push(`categories: [${categories.map((c) => `"${c}"`).join(', ')}]`)
    }
  }

  frontmatter.push('---')

  const markdownContent = htmlToMarkdown(thought.content.rendered)

  return `${frontmatter.join('\n')}\n\n# ${thought.title.rendered}\n\n${markdownContent}`
}
