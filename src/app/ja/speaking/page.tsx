import SpeakingPageContent from '@/components/containers/pages/SpeakingPage'
import { loadWPEvents } from '@/libs/dataSources/events'
import { buildAlternates } from '@/libs/metadata'

export const metadata = {
  alternates: buildAlternates('/ja/speaking'),
  title: '登壇・講演',
}

export default async function SpeakingPage() {
  const wpEvents = await loadWPEvents()

  return <SpeakingPageContent lang="ja" events={wpEvents} basePath="/ja/event-reports" />
}
