import SpeakingPageContent from '@/components/containers/pages/SpeakingPage'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'

export const metadata = {
  title: 'Speaking',
}

export default async function SpeakingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const events = await microCMS.listEndedEvents()

  return <SpeakingPageContent lang="en" events={events} />
}

