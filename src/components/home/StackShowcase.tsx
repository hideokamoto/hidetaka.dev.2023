import Container from '@/components/tailwindui/Container'
import SectionHeader from '@/components/ui/SectionHeader'
import StackItemCard from '@/components/ui/StackItemCard'

type StackItem = {
  name: string
  description: string
  gradient: string
  href?: string
  linkLabel?: string
}

type StackCategory = {
  category: string
  items: StackItem[]
}

// gradient はブランドカラーに合わせて割当（ja/en 共通）
const GRADIENTS = {
  aws: 'from-[#fbbf24] via-[#f97316] to-[#ef4444]',
  cloudflare: 'from-[#f97316] via-[#fb923c] to-[#facc15]',
  next: 'from-[#6366f1] via-[#14b8a6] to-[#06b6d4]',
  react: 'from-[#06b6d4] via-[#22d3ee] to-[#38bdf8]',
  stripe: 'from-[#635bff] via-[#7f7bff] to-[#35b5ff]',
  wordpress: 'from-[#21759b] via-[#2dd4bf] to-[#60a5fa]',
  circleci: 'from-[#10b981] via-[#34d399] to-[#6ee7b7]',
  ghActions: 'from-[#2088ff] via-[#6366f1] to-[#8b5cf6]',
  mcp: 'from-[#7c3aed] via-[#a855f7] to-[#d946ef]',
  claude: 'from-[#d97757] via-[#e0855f] to-[#eaa07f]',
} as const

const CATEGORIES_EN: StackCategory[] = [
  {
    category: 'Backend & Infrastructure',
    items: [
      {
        name: 'AWS Serverless',
        description: 'Lambda · Step Functions · DynamoDB',
        gradient: GRADIENTS.aws,
      },
      { name: 'Cloudflare', description: 'Workers · Pages · R2', gradient: GRADIENTS.cloudflare },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'Next.js', description: 'App Router · ISR · Edge', gradient: GRADIENTS.next },
      {
        name: 'React',
        description: 'TypeScript · Hooks · Server Components',
        gradient: GRADIENTS.react,
      },
    ],
  },
  {
    category: 'Payment & SaaS',
    items: [
      {
        name: 'Stripe',
        description: 'Billing · Connect · Radar',
        gradient: GRADIENTS.stripe,
        href: 'https://revtrona.com',
        linkLabel: 'Details at Revtrona.com',
      },
    ],
  },
  {
    category: 'CMS & Content',
    items: [
      {
        name: 'WordPress',
        description: 'Enterprise · Headless · VIP',
        gradient: GRADIENTS.wordpress,
      },
    ],
  },
  {
    category: 'DevOps & CI/CD',
    items: [
      { name: 'CircleCI', description: 'Orbs · Workflows · Config', gradient: GRADIENTS.circleci },
      {
        name: 'GitHub Actions',
        description: 'Automation · Testing',
        gradient: GRADIENTS.ghActions,
      },
    ],
  },
  {
    category: 'AI Development',
    items: [
      { name: 'MCP', description: 'Server Development · Integration', gradient: GRADIENTS.mcp },
      { name: 'Claude Code', description: 'AI-assisted Development', gradient: GRADIENTS.claude },
    ],
  },
]

const CATEGORIES_JA: StackCategory[] = [
  {
    category: 'バックエンド・インフラ',
    items: [
      {
        name: 'AWS Serverless',
        description: 'Lambda / Step Functions / DynamoDB',
        gradient: GRADIENTS.aws,
      },
      { name: 'Cloudflare', description: 'Workers / Pages / R2', gradient: GRADIENTS.cloudflare },
    ],
  },
  {
    category: 'フロントエンド',
    items: [
      { name: 'Next.js', description: 'App Router / ISR / Edge', gradient: GRADIENTS.next },
      {
        name: 'React',
        description: 'TypeScript / Hooks / Server Components',
        gradient: GRADIENTS.react,
      },
    ],
  },
  {
    category: '決済・SaaS',
    items: [
      {
        name: 'Stripe',
        description: 'Billing / Connect / Radar',
        gradient: GRADIENTS.stripe,
        href: 'https://revtrona.com',
        linkLabel: 'Revtronaで詳しく',
      },
    ],
  },
  {
    category: 'CMS・コンテンツ',
    items: [
      {
        name: 'WordPress',
        description: 'Enterprise / Headless / VIP',
        gradient: GRADIENTS.wordpress,
      },
    ],
  },
  {
    category: 'DevOps・CI/CD',
    items: [
      { name: 'CircleCI', description: 'Orbs / Workflows / Config', gradient: GRADIENTS.circleci },
      {
        name: 'GitHub Actions',
        description: 'Automation / Testing',
        gradient: GRADIENTS.ghActions,
      },
    ],
  },
  {
    category: 'AI開発',
    items: [
      { name: 'MCP', description: 'Server Development / Integration', gradient: GRADIENTS.mcp },
      { name: 'Claude Code', description: 'AI-assisted Development', gradient: GRADIENTS.claude },
    ],
  },
]

export default function StackShowcase({ lang }: { lang: string }) {
  const isJa = lang === 'ja'
  const categories = isJa ? CATEGORIES_JA : CATEGORIES_EN

  const title = isJa
    ? '信頼するスタックで、事業のスピードを最大化'
    : 'Move faster on a trusted platform stack'
  const subtitle = isJa
    ? 'バックエンドからフロントエンド、CI/CD、AI開発まで。役割ごとに整理した技術スタックで、開発から運用までをシームレスに繋ぎます。'
    : 'From backend to frontend, CI/CD, and AI development—an organized stack that connects everything from development to operations.'
  const focusLabel = isJa ? '専門領域' : 'Focus'

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeader title={title} description={subtitle} align="center" />

        <div className="mt-20 space-y-16 lg:space-y-20">
          {categories.map((category) => (
            <div key={category.category}>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {category.category}
              </h3>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <StackItemCard
                    key={item.name}
                    name={item.name}
                    description={item.description}
                    gradient={item.gradient}
                    href={item.href}
                    linkLabel={item.linkLabel}
                    focusLabel={focusLabel}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
