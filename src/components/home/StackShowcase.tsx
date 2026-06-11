import Container from '@/components/tailwindui/Container'
import SectionHeader from '@/components/ui/SectionHeader'
import StackItemCard from '@/components/ui/StackItemCard'

type StackItem = {
  name: string
  description: string
  gradient: string
}

export default function StackShowcase({ lang }: { lang: string }) {
  const items: StackItem[] = [
    {
      name: 'Stripe',
      description: lang === 'ja' ? 'Billing / Connect / Radar' : 'Billing · Connect · Radar',
      gradient: 'from-[#635bff] via-[#7f7bff] to-[#35b5ff]',
    },
    {
      name: 'AWS Serverless',
      description:
        lang === 'ja' ? 'Lambda / Step Functions / DynamoDB' : 'Lambda · Step Functions · DynamoDB',
      gradient: 'from-[#fbbf24] via-[#f97316] to-[#ef4444]',
    },
    {
      name: 'Cloudflare',
      description: lang === 'ja' ? 'Workers / Pages / Zero Trust' : 'Workers · Pages · Zero Trust',
      gradient: 'from-[#f97316] via-[#fb923c] to-[#facc15]',
    },
    {
      name: 'WordPress',
      description: lang === 'ja' ? 'Enterprise / Headless / VIP' : 'Enterprise · Headless · VIP',
      gradient: 'from-[#21759b] via-[#2dd4bf] to-[#60a5fa]',
    },
    {
      name: 'Next.js',
      description: lang === 'ja' ? 'App Router / ISR / Edge' : 'App Router · ISR · Edge',
      gradient: 'from-[#6366f1] via-[#14b8a6] to-[#06b6d4]',
    },
  ]

  const title = lang === 'ja' ? '専門としている技術スタック' : 'The stack I work and write about'
  const subtitle =
    lang === 'ja'
      ? '決済・サーバーレス・WordPressを軸に、登壇や記事を通じて知見を共有しています。'
      : 'Centered on payments, serverless, and WordPress—shared through talks and writing.'

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeader title={title} description={subtitle} align="center" />

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <StackItemCard
              key={item.name}
              name={item.name}
              description={item.description}
              gradient={item.gradient}
              focusLabel={lang === 'ja' ? '専門領域' : 'Focus'}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
