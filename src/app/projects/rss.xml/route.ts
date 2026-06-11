import { SITE_CONFIG } from '@/config'
import { loadAllDevNotes } from '@/libs/dataSources/devnotes'
import { generateRssXml, type RssItem } from '@/libs/rss'

// 30分ごとに再生成（dev-notes記事の更新に追随）
export const revalidate = 1800

/**
 * 自前コンテンツ（writing / dev-notes）のRSS 2.0フィードを配信する。
 * layout.tsx が宣言する <link rel="alternate" href="/projects/rss.xml" /> の実体。
 */
export async function GET() {
  const notes = await loadAllDevNotes('en')

  const items: RssItem[] = notes
    .filter((note) => Boolean(note.datetime))
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 30)
    .map((note) => ({
      title: note.title,
      link: `${SITE_CONFIG.url}${note.href}`,
      description: note.description,
      pubDate: note.datetime,
    }))

  const xml = generateRssXml({
    title: `${SITE_CONFIG.author.name} — Writing`,
    link: `${SITE_CONFIG.url}/writing`,
    description:
      'Articles and dev notes on Stripe, AWS Serverless, WordPress, and developer communities by Hidetaka Okamoto.',
    feedUrl: `${SITE_CONFIG.url}${SITE_CONFIG.rss.path}`,
    items,
  })

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
