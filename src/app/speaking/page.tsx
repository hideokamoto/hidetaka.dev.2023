import SpeakingPageContent from '@/components/containers/pages/SpeakingPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Speaking',
}

export default async function SpeakingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const events = await microCMS.listEndedEvents()

  return <SpeakingPageContent lang="en" events={events} />
}

