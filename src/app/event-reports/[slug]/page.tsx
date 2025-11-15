import { notFound } from 'next/navigation'
import SpeakingDetailPageContent from '@/components/containers/pages/SpeakingDetailPage'
import { getAdjacentEvents, getWPEventBySlug } from '@/libs/dataSources/events'

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

  // 前後の記事を取得
  const { previous, next } = await getAdjacentEvents(event)

  return (
    <SpeakingDetailPageContent
      event={event}
      lang="en"
      basePath="/event-reports"
      previousEvent={previous}
      nextEvent={next}
    />
  )
}
