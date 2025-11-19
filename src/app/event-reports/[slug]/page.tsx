import { notFound } from 'next/navigation'
import SpeakingDetailPageContent from '@/components/containers/pages/SpeakingDetailPage'
import type { WPEvent } from '@/libs/dataSources/types'
import { getAdjacentEvents, getRelatedEvents, getWPEventBySlug } from '@/libs/dataSources/events'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getWPEventBySlug(slug)

  if (!event) {
    return {
      title: 'Speaking Report',
    }
  }

  return {
    title: event.title.rendered,
    description: event.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
  }
}

export default async function SpeakingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getWPEventBySlug(slug)

  if (!event) {
    notFound()
  }

  // notFound()の後なので、eventは確実にWPEvent型
  const validEvent = event as WPEvent

  // 前後の記事と関連記事を取得
  const [{ previous, next }, relatedEvents] = await Promise.all([
    getAdjacentEvents(validEvent),
    getRelatedEvents(validEvent, 4, 'en'),
  ])

  return (
    <SpeakingDetailPageContent
      event={validEvent}
      lang="en"
      basePath="/event-reports"
      previousEvent={previous}
      nextEvent={next}
      relatedEvents={relatedEvents}
    />
  )
}
