import Container from '@/components/tailwindui/Container'

type Capability = {
  title: string
  description: string
  highlights: string[]
}

function CapabilityCard({ capability }: { capability: Capability }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-10 transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {capability.title}
      </h3>
      <p className="mt-6 text-base leading-relaxed text-slate-700 dark:text-slate-400">{capability.description}</p>
      <ul className="mt-8 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {capability.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-4">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Capabilities({ lang }: { lang: string }) {
  const sectionTitle =
    lang === 'ja'
      ? 'SaaSグロースのためのフルスタックエンジニアリング'
      : 'Full-stack engineering for SaaS growth'
  const sectionDescription =
    lang === 'ja'
      ? 'Stripeの決済導線設計からAWS/Lambdaによるサーバーレス構築、WordPressによるメディア・マーケティング基盤まで。プロダクトの継続的な収益化と高速な実験を支援します。'
      : 'From Stripe monetization flows to AWS serverless architecture and WordPress-powered marketing platforms. I help teams unlock recurring revenue and ship experiments faster.'

  const capabilities: Capability[] =
    lang === 'ja'
      ? [
          {
            title: 'Stripeで収益を最大化',
            description:
              'プロダクトのLTV向上に向けて料金プランや請求オートメーションを設計。Billing・Connect・Radarを活用し、SaaS/マーケットプレイスの成長を伴走します。',
            highlights: [
              '従量課金・年額契約など柔軟なプライシング設計',
              'SaaS指標を可視化するダッシュボードと分析環境',
              'Revenue Recognitionや自動請求オペレーションの整備',
            ],
          },
          {
            title: 'AWS Serverless × Cloudflareでスケール',
            description:
              'Lambda、Step Functions、Cloudflare Workersを組み合わせ、負荷に応じてシームレスにスケールするバックエンドを構築。グローバルユーザーにも高速な体験を提供します。',
            highlights: [
              'マルチリージョン対応のAPIとジョブパイプライン',
              'IaC・CI/CDを用いた運用負担の最小化',
              'Observabilityとセキュリティベストプラクティスの実装',
            ],
          },
          {
            title: 'WordPressでマーケ&コンテンツを加速',
            description:
              'WordPressサイトやHeadlessサイトを設計。リード獲得やコミュニティ施策と連携し、開発とマーケが並走できる仕組みを整えます。',
            highlights: [
              'WordPress / Headless WordPress / Cloudflare Pagesの運用',
              'MicroCMSや外部SaaSとのハイブリッドな連携',
              '編集体験と高速表示を両立するユーザー体験',
            ],
          },
        ]
      : [
          {
            title: 'Monetize with Stripe confidence',
            description:
              'Design pricing strategies, billing automation, and compliant payment flows that increase LTV. I partner with founders to implement Billing, Connect, and Radar for SaaS and marketplaces.',
            highlights: [
              'Flexible pricing with usage-based or annual plans',
              'Growth dashboards to illuminate core SaaS metrics',
              'Revenue Recognition and automated billing operations',
            ],
          },
          {
            title: 'Scale on AWS Serverless & Cloudflare',
            description:
              'Combine Lambda, Step Functions, and Cloudflare Workers to deliver resilient, globally distributed backend experiences. Built for cost efficiency, observability, and rapid experimentation.',
            highlights: [
              'Multi-region APIs and asynchronous job pipelines',
              'Infrastructure-as-code with frictionless CI/CD',
              'Embedded security and runtime insights by default',
            ],
          },
          {
            title: 'Accelerate content with WordPress',
            description:
              'Design WordPress sites and headless sites. Integrate with lead generation and community initiatives, enabling development and marketing to work in parallel.',
            highlights: [
              'WordPress / Headless WordPress / Cloudflare Pages operations',
              'Hybrid integrations with MicroCMS and existing SaaS',
              'User experience balancing editing UX and speed',
            ],
          },
        ]

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-400">{sectionDescription}</p>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-3 lg:gap-12">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.title} capability={capability} />
          ))}
        </div>
      </Container>
    </section>
  )
}
