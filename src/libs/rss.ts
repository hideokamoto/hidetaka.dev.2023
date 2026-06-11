export type RssItem = {
  title: string
  link: string
  description: string
  pubDate: string
}

export type RssChannel = {
  title: string
  link: string
  description: string
  feedUrl: string
  language?: string
  items: RssItem[]
}

/**
 * XML特殊文字をエスケープする
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * RFC822形式の日付文字列に変換する（不正な日付はnullを返す）
 */
export function toRfc822(input: string): string | null {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toUTCString()
}

/**
 * RSS 2.0フィードのXML文字列を生成する
 */
export function generateRssXml(channel: RssChannel): string {
  const items = channel.items
    .map((item) => {
      const pubDate = toRfc822(item.pubDate)
      const dateLine = pubDate ? `      <pubDate>${pubDate}</pubDate>\n` : ''
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
${dateLine}      <description>${escapeXml(item.description)}</description>
    </item>`
    })
    .join('\n')

  const lastBuildDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${escapeXml(channel.language ?? 'en')}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}
