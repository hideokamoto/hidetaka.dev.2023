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
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            >
              <div
                className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r ${item.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-md`}
              >
                {item.name}
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {lang === 'ja' ? '専門領域' : 'Focus'}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
