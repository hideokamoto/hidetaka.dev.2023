import Container from '@/components/tailwindui/Container'
import HubSpotForm from '@/components/ui/HubSpotForm'
import PageHeader from '@/components/ui/PageHeader'

export const metadata = {
  title: '登壇依頼',
  description: 'イベントやカンファレンスへの登壇依頼はこちらからお願いします。',
}

export default function SpeakingRequestPage() {
  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader
          title="登壇依頼"
          description="イベントやカンファレンスへの登壇をご依頼いただける場合は、以下のフォームにイベントの詳細をご記入ください。できるだけ早くご返信いたします。"
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

