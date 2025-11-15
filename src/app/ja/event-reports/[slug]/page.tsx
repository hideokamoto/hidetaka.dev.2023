import SpeakingDetailPageContent from '@/components/containers/pages/SpeakingDetailPage'
import { getWPEventBySlug, getAdjacentEvents } from '@/libs/dataSources/events'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getWPEventBySlug(slug)

  if (!event) {
    return {
      title: '登壇レポート',
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

  // 前後の記事を取得
  const { previous, next } = await getAdjacentEvents(event)

  return (
    <SpeakingDetailPageContent
      event={event}
      lang="ja"
      basePath="/ja/event-reports"
      previousEvent={previous}
      nextEvent={next}
    />
  )
}

