import SpeakingPageContent from '@/components/containers/pages/SpeakingPage'
import { loadWPEvents } from '@/libs/dataSources/events'
import { buildAlternates } from '@/libs/metadata'

export const metadata = {
  alternates: buildAlternates('/speaking'),
  title: 'Speaking',
}

export default async function SpeakingPage() {
  const wpEvents = await loadWPEvents()

  return <SpeakingPageContent lang="en" events={wpEvents} basePath="/event-reports" />
}
