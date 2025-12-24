import { notFound } from 'next/navigation'
import SpeakingDetailPageContent from '@/components/containers/pages/SpeakingDetailPage'
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

  // Get adjacent and related articles
  const [{ previous, next }, relatedEvents] = await Promise.all([
    getAdjacentEvents(event),
    getRelatedEvents(event, 4, 'en'),
  ])

  return (
    <SpeakingDetailPageContent
      event={event}
      lang="en"
      basePath="/event-reports"
      previousEvent={previous}
      nextEvent={next}
      relatedEvents={relatedEvents}
    />
  )
}
