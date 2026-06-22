import Container from '@/components/tailwindui/Container'
import RvtCard from '@/components/ui/RvtCard'
import RvtEyebrow from '@/components/ui/RvtEyebrow'

type Capability = {
  title: string
  description: string
  highlights: string[]
  index: number
}

function CapabilityCard({ capability }: { capability: Capability }) {
  const eyebrow = `0${capability.index} / AREA`
  return (
    <RvtCard
      eyebrow={eyebrow}
      title={capability.title}
      description={capability.description}
      bullets={capability.highlights}
      accent="top"
      className="h-full"
    />
  )
}

export default function Capabilities({ lang }: { lang: string }) {
  const sectionTitle = lang === 'ja' ? '私ができること' : 'What I Bring to the Table'
  const sectionDescription =
    lang === 'ja'
      ? 'Stripeの決済導線設計からAWS/Lambdaによるサーバーレス構築、WordPressによるメディア・マーケティング基盤まで。プロダクトの継続的な収益化と高速な実験を支援します。'
      : 'From Stripe monetization flows to AWS serverless architecture and WordPress-powered marketing platforms. I help teams unlock recurring revenue and ship experiments faster.'

  const capabilities: Omit<Capability, 'index'>[] =
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
          {
            title: 'システムデザインでスケーラブルなアーキテクチャを構築',
            description:
              '堅牢で保守性の高いシステムを設計。マイクロサービスやイベント駆動型アーキテクチャで、製品の成長に合わせたバックエンドを構築します。',
            highlights: [
              'マイクロサービス・API・イベント駆動型アーキテクチャ設計',
              '成長に対応するデータベース設計と最適化',
              'レジリエント設計とフェイルオーバー戦略',
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
          {
            title: 'Design scalable architectures with System Design expertise',
            description:
              'Craft robust, maintainable systems that grow with your product. I design distributed architectures that balance scalability, reliability, and developer productivity for long-term success.',
            highlights: [
              'Microservices, APIs, and event-driven architectures',
              'Database design and optimization for growth',
              'System resilience and failover strategies',
            ],
          },
        ]

  return (
    <section
      style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--rvt-border)' }}
      className="py-24 sm:py-32"
    >
      <Container>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <RvtEyebrow className="mb-5">CAPABILITIES</RvtEyebrow>
          <h2
            style={{
              margin: '0 0 18px',
              fontFamily: 'var(--rvt-font-display)',
              fontSize: 'clamp(1.8rem, 3.4vw, 2.375rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.04em',
              color: 'var(--rvt-fg)',
            }}
          >
            {sectionTitle}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.8,
              color: 'var(--rvt-fg2)',
            }}
          >
            {sectionDescription}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, i) => (
            <CapabilityCard key={capability.title} capability={{ ...capability, index: i + 1 }} />
          ))}
        </div>
      </Container>
    </section>
  )
}
