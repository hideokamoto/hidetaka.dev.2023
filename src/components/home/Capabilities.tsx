import Container from '@/components/tailwindui/Container'
import SectionHeader from '@/components/ui/SectionHeader'

type Capability = {
  icon?: string
  title: string
  description: string
  highlights: string[]
}

function CapabilityCard({ capability }: { capability: Capability }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-10 transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
      {capability.icon && (
        <span className="text-3xl" aria-hidden="true">
          {capability.icon}
        </span>
      )}
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {capability.title}
      </h3>
      <p className="mt-6 text-base leading-relaxed text-slate-700 dark:text-slate-400">
        {capability.description}
      </p>
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
  const isJa = lang === 'ja'

  const sectionTitle = isJa
    ? '開発者体験を高めるツールとアーキテクチャ'
    : 'Empowering developers through better tools and architecture'
  const sectionDescription = isJa
    ? 'サーバーレス開発からフロントエンド、開発者ツールの整備、コミュニティ活動まで。マルチスキルなエンジニアリングで開発者体験を高め、プロダクトの成長を支援します。'
    : 'From serverless development and frontend engineering to developer tooling and community work. I improve developer experience across the stack to help products grow.'

  const capabilities: Capability[] = isJa
    ? [
        {
          icon: '⚡',
          title: 'サーバーレス開発',
          description:
            'AWS Lambda や Cloudflare Workers を活用し、負荷に応じてスケールするアプリケーションを構築します。',
          highlights: [
            'イベント駆動型アーキテクチャの設計',
            'マイクロサービスの実装',
            'コスト最適化とObservability',
          ],
        },
        {
          icon: '🎨',
          title: 'フロントエンド開発',
          description:
            'React と Next.js でモダンでアクセシブルな Web UI を開発します。型安全性とパフォーマンスを重視します。',
          highlights: [
            'TypeScript による型安全な実装',
            'パフォーマンス最適化',
            'レスポンシブ・アクセシブルなUI',
          ],
        },
        {
          icon: '🛠️',
          title: '開発者ツールと自動化',
          description:
            'CI/CD、テスト、開発者体験(DX)の改善に取り組みます。チームの生産性を底上げする仕組みを整えます。',
          highlights: [
            'CircleCI パイプラインの最適化',
            'GitHub Actions による自動化',
            'MCP サーバー開発・AI活用',
          ],
        },
        {
          icon: '🌐',
          title: 'コミュニティとコンテンツ',
          description:
            '技術記事の執筆、登壇、コミュニティ運営を通じて、開発者同士の学びと交流を支えます。',
          highlights: [
            '1000本以上の技術記事',
            'カンファレンスでの登壇',
            '10年以上のコミュニティ運営',
          ],
        },
      ]
    : [
        {
          icon: '⚡',
          title: 'Serverless Development',
          description:
            'Build applications that scale with demand using AWS Lambda and Cloudflare Workers.',
          highlights: [
            'Event-driven architecture design',
            'Microservices implementation',
            'Cost optimization and observability',
          ],
        },
        {
          icon: '🎨',
          title: 'Frontend Development',
          description:
            'Develop modern, accessible web UIs with React and Next.js, with a focus on type safety and performance.',
          highlights: [
            'Type-safe implementation with TypeScript',
            'Performance optimization',
            'Responsive and accessible UI',
          ],
        },
        {
          icon: '🛠️',
          title: 'Developer Tools & Automation',
          description:
            'Improve CI/CD, testing, and developer experience (DX) to boost team productivity.',
          highlights: [
            'CircleCI pipeline optimization',
            'GitHub Actions automation',
            'MCP server development and AI tooling',
          ],
        },
        {
          icon: '🌐',
          title: 'Community & Content',
          description:
            'Support developer learning and connection through technical writing, speaking, and community building.',
          highlights: [
            '1000+ technical articles',
            'Conference speaking',
            'Community building (10+ years)',
          ],
        },
      ]

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeader title={sectionTitle} description={sectionDescription} align="center" />

        <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.title} capability={capability} />
          ))}
        </div>
      </Container>
    </section>
  )
}
