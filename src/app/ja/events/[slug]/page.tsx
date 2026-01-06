import { notFound } from 'next/navigation'
import EventDetailPageContent from '@/components/containers/pages/EventDetailPage'
import JsonLd from '@/components/JsonLd'
import {
  getAdjacentEvents,
  getRelatedEvents,
  getWPEventBySlug,
} from '@/libs/dataSources/events'
import type { WPThought } from '@/libs/dataSources/types'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

// WPEventをWPThoughtに変換するヘルパー関数
function eventToThought(event: {
  id: number
  title: { rendered: string }
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  excerpt: { rendered: string }
  content: { rendered: string }
  link: string
  slug: string
  featured_media?: number
}): WPThought {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    date_gmt: event.date_gmt,
    modified: event.modified,
    modified_gmt: event.modified_gmt,
    excerpt: event.excerpt || { rendered: '' },
    content: event.content,
    link: event.link,
    slug: event.slug,
    featured_media: event.featured_media,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getWPEventBySlug(slug)

  if (!event) {
    return {
      title: 'イベント',
    }
  }

  // WPEventをWPThought形式に変換してメタデータを生成
  const thought = eventToThought(event)

  return generateBlogPostMetadata(thought)
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getWPEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const lang = 'ja'
  const basePath = '/ja/events'

  // はてなスター機能の有効化判定
  // 環境変数で制御し、かつ日本語ページでのみ表示
  const enableHatenaStar = process.env.NEXT_PUBLIC_ENABLE_HATENA_STAR === 'true' && lang === 'ja'

  // JSON-LDを生成
  const thought = eventToThought(event)
  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, lang, basePath)
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, lang, basePath)

  // 前後の記事と関連記事を取得
  const [adjacentEvents, relatedEvents] = await Promise.all([
    getAdjacentEvents(event),
    getRelatedEvents(event, 4, lang, basePath),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <EventDetailPageContent
        event={event}
        lang={lang}
        basePath={basePath}
        previousEvent={adjacentEvents.previous}
        nextEvent={adjacentEvents.next}
        relatedEvents={relatedEvents}
        enableHatenaStar={enableHatenaStar}
      />
    </>
  )
}

