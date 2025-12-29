/**
 * HTMLをMarkdown形式に変換するユーティリティ関数
 * WordPressのHTML記事をMarkdownに変換する
 */

/**
 * HTMLタグを段階的にMarkdownに変換
 */
export function htmlToMarkdown(html: string): string {
  let markdown = html

  // コードブロック（pre + code）
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_match, code) => {
      const decodedCode = decodeHtmlEntities(code)
      return `\n\`\`\`\n${decodedCode}\n\`\`\`\n`
    },
  )

  // インラインコード
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, (_match, code) => {
    return `\`${code}\``
  })

  // 見出し（h1-h6）
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_match, text) => `\n# ${text}\n`)
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_match, text) => `\n## ${text}\n`)
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_match, text) => `\n### ${text}\n`)
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_match, text) => `\n#### ${text}\n`)
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (_match, text) => `\n##### ${text}\n`)
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, (_match, text) => `\n###### ${text}\n`)

  // 強調（bold）
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_match, text) => `**${text}**`)
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, (_match, text) => `**${text}**`)

  // 斜体（italic）
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, (_match, text) => `*${text}*`)
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, (_match, text) => `*${text}*`)

  // リンク
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_match, href, text) => {
    return `[${text}](${href})`
  })

  // 画像
  markdown = markdown.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    (_match, src, alt) => {
      return `![${alt}](${src})`
    },
  )
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, (_match, src) => {
    return `![](${src})`
  })

  // 順序なしリスト
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, content) => {
    const listItems = content.replace(
      /<li[^>]*>(.*?)<\/li>/gi,
      (_m: string, item: string) => `- ${item.trim()}\n`,
    )
    return `\n${listItems}\n`
  })

  // 順序付きリスト
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, content) => {
    let counter = 1
    const listItems = content.replace(/<li[^>]*>(.*?)<\/li>/gi, (_m: string, item: string) => {
      return `${counter++}. ${item.trim()}\n`
    })
    return `\n${listItems}\n`
  })

  // 引用
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
    const lines = content
      .split('\n')
      .map((line: string) => `> ${line.trim()}`)
      .join('\n')
    return `\n${lines}\n`
  })

  // 水平線
  markdown = markdown.replace(/<hr[^>]*\/?>/gi, '\n---\n')

  // 改行
  markdown = markdown.replace(/<br[^>]*\/?>/gi, '\n')

  // 段落
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, content) => {
    return `\n${content.trim()}\n`
  })

  // div（段落として扱う）
  markdown = markdown.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_match, content) => {
    return `\n${content.trim()}\n`
  })

  // 残りのHTMLタグを削除
  markdown = markdown.replace(/<[^>]+>/g, '')

  // HTMLエンティティをデコード
  markdown = decodeHtmlEntities(markdown)

  // 連続する空行を削除
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
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
  }

  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }

  // 数値エンティティをデコード（例: &#8217; → '）
  decoded = decoded.replace(/&#(\d+);/g, (_match, dec) => {
    return String.fromCharCode(Number.parseInt(dec, 10))
  })

  return decoded
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
