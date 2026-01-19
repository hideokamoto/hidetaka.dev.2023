import SpeakingPageContent from '@/components/containers/pages/SpeakingPage'
import { loadWPEvents } from '@/libs/dataSources/events'

export const metadata = {
  title: 'Speaking',
}

export default async function SpeakingPage() {
  const wpEvents = await loadWPEvents()

  // 日付でソート（新しい順）
  const sortedEvents = wpEvents.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  return <SpeakingPageContent lang="en" events={sortedEvents} basePath="/event-reports" />
}
