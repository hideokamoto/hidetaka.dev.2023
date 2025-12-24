import Container from '@/components/tailwindui/Container'
import HubSpotForm from '@/components/ui/HubSpotForm'
import PageHeader from '@/components/ui/PageHeader'

export const metadata = {
  title: 'Speaking Request',
  description: 'Request Hidetaka Okamoto to speak at your event or conference.',
}

export default function SpeakingRequestPage() {
  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader
          title="Speaking Request"
          description="Interested in having me speak at your event or conference? Please fill out the form below with details about your event, and I'll get back to you as soon as possible."
        />

        <div className="max-w-2xl mx-auto mt-8">
          <HubSpotForm
            formId={process.env.NEXT_PUBLIC_HUBSPOT_SPEAKING_FORM_ID || ''}
            portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}
            className="bg-white dark:bg-zinc-900 rounded-lg p-6"
          />
        </div>
      </Container>
    </section>
  )
}

