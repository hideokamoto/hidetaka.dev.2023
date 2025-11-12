import Container from '@/components/tailwindui/Container'

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
      description: lang === 'ja' ? 'Lambda / Step Functions / DynamoDB' : 'Lambda · Step Functions · DynamoDB',
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

  const title =
    lang === 'ja' ? '信頼するスタックで、事業のスピードを最大化' : 'Move faster on a trusted platform stack'
  const subtitle =
    lang === 'ja'
      ? 'パートナー企業との共創やエコシステム構築を前提に、開発から運用までをシームレスに繋ぎます。'
      : 'Built for collaborative ecosystems—seamless from development to operations.'

  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r ${item.gradient} px-4 py-2 text-sm font-semibold text-white shadow-sm`}
              >
                {item.name}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {lang === 'ja' ? '専門領域' : 'Focus'}
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
