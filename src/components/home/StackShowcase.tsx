import Container from '@/components/tailwindui/Container'
import RvtCard from '@/components/ui/RvtCard'
import RvtEyebrow from '@/components/ui/RvtEyebrow'

type StackItem = {
  name: string
  description: string
  highlights: string[]
}

export default function StackShowcase({ lang }: { lang: string }) {
  const items: StackItem[] = [
    {
      name: 'Stripe',
      description: lang === 'ja' ? 'Billing / Connect / Radar' : 'Billing · Connect · Radar',
      highlights:
        lang === 'ja'
          ? ['決済フロー設計', 'サブスクリプション管理', 'Stripe Apps開発']
          : ['Payment flow design', 'Subscription management', 'Stripe Apps development'],
    },
    {
      name: 'AWS Serverless',
      description:
        lang === 'ja' ? 'Lambda / Step Functions / DynamoDB' : 'Lambda · Step Functions · DynamoDB',
      highlights:
        lang === 'ja'
          ? ['イベント駆動アーキテクチャ', 'マルチリージョン API', 'IaC & CI/CD']
          : ['Event-driven architecture', 'Multi-region APIs', 'IaC & CI/CD'],
    },
    {
      name: 'Cloudflare',
      description: lang === 'ja' ? 'Workers / Pages / Zero Trust' : 'Workers · Pages · Zero Trust',
      highlights:
        lang === 'ja'
          ? ['エッジコンピューティング', 'CDN & パフォーマンス', 'セキュリティ']
          : ['Edge computing', 'CDN & performance', 'Zero Trust security'],
    },
    {
      name: 'WordPress',
      description: lang === 'ja' ? 'Enterprise / Headless / VIP' : 'Enterprise · Headless · VIP',
      highlights:
        lang === 'ja'
          ? ['ヘッドレス構成', 'プラグイン開発', 'マーケティング統合']
          : ['Headless architecture', 'Plugin development', 'Marketing integrations'],
    },
    {
      name: 'Next.js',
      description: lang === 'ja' ? 'App Router / ISR / Edge' : 'App Router · ISR · Edge',
      highlights:
        lang === 'ja'
          ? ['App Router & RSC', 'ISR & パフォーマンス', 'Cloudflare Workers 対応']
          : ['App Router & RSC', 'ISR & performance', 'Cloudflare Workers deploy'],
    },
  ]

  const title =
    lang === 'ja'
      ? '信頼するスタックで、事業のスピードを最大化'
      : 'Move faster on a trusted platform stack'
  const subtitle =
    lang === 'ja'
      ? 'パートナー企業との共創やエコシステム構築を前提に、開発から運用までをシームレスに繋ぎます。'
      : 'Built for collaborative ecosystems—seamless from development to operations.'

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        background: 'var(--rvt-bg2)',
        borderTop: '1px solid var(--rvt-border)',
        borderBottom: '1px solid var(--rvt-border)',
      }}
      className="py-24 sm:py-32"
    >
      <Container>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <RvtEyebrow className="mb-5">TECH STACK</RvtEyebrow>
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
            {title}
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
            {subtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <RvtCard
              key={item.name}
              eyebrow={lang === 'ja' ? '専門領域' : 'FOCUS'}
              title={item.name}
              description={item.description}
              bullets={item.highlights}
              accent="top"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
