import Container from '@/components/tailwindui/Container'

type Capability = {
  title: string
  description: string
  highlights: string[]
}

function CapabilityCard({ capability }: { capability: Capability }) {
  return (
    <article className="group relative flex h-full flex-col border-t-4 border-zinc-200 bg-white p-8 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
        {capability.title}
      </h3>
      <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{capability.description}</p>
      <ul className="mt-6 space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
        {capability.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400" />
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
              'グローバルに展開可能なWordPressテーマ・Headless構成を設計。リード獲得やコミュニティ施策と連携し、開発とマーケが並走できる仕組みを整えます。',
            highlights: [
              'WordPress VIP / Headless / Cloudflare Pagesの運用',
              'MicroCMSや外部SaaSとのハイブリッドな連携',
              '編集体験と高速表示を両立するデザインシステム',
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
              'Architect WordPress themes and headless stacks that integrate with modern SaaS tooling. Empower marketing teams while maintaining engineering standards and blazing performance.',
            highlights: [
              'WordPress VIP, headless frontends, Cloudflare Pages',
              'Hybrid integrations with MicroCMS and existing SaaS',
              'Design systems balancing editing UX and speed',
            ],
          },
        ]

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400">{sectionDescription}</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.title} capability={capability} />
          ))}
        </div>
      </Container>
    </section>
  )
}
