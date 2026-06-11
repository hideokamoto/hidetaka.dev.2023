import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import SectionHeader from '@/components/ui/SectionHeader'

type Highlight = {
  title: string
  description: string
  items: string[]
  link?: { href: string; label: string }
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-10 transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {highlight.title}
      </h3>
      <p className="mt-6 text-base leading-relaxed text-slate-700 dark:text-slate-400">
        {highlight.description}
      </p>
      <ul className="mt-8 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {highlight.items.map((item) => (
          <li key={item} className="flex items-start gap-4">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {highlight.link && (
        <Link
          href={highlight.link.href}
          className="group/link mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all hover:gap-2.5 dark:text-indigo-400"
        >
          <span>{highlight.link.label}</span>
          <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
        </Link>
      )}
    </article>
  )
}

export default function Highlights({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  const sectionTitle = isJa ? '活動と実績' : 'Work & Track Record'
  const sectionDescription = isJa
    ? '登壇・コミュニティ運営・認定資格・技術発信を通じて、開発者とビジネスの橋渡しをしています。'
    : 'Bridging developers and business through speaking, community building, certifications, and technical writing.'

  const highlights: Highlight[] = isJa
    ? [
        {
          title: '登壇・カンファレンス運営',
          description:
            '国内外のカンファレンスで登壇・実行委員長を務めています。決済・サーバーレス・WordPressをテーマに継続的に発信しています。',
          items: [
            'WordCamp Kansai 2024 実行委員長',
            'JP_Stripes Connect 2019（日本初のStripeユーザーカンファレンス）実行委員長',
            'AWS・Stripe・WordPress 各コミュニティでの多数の登壇',
          ],
          link: { href: '/ja/speaking', label: '登壇実績を見る' },
        },
        {
          title: 'コミュニティ運営',
          description:
            '複数の開発者コミュニティを立ち上げ・運営。エコシステムづくりと知見の循環に取り組んでいます。',
          items: [
            'JP_Stripes（Stripe ユーザーコミュニティ）founder',
            'wp-kyoto を10年以上運営する技術ブログ',
            'AWS Samurai 2017 / Alexa Champions / AWS Community Builders',
          ],
        },
        {
          title: '認定資格',
          description:
            'Stripeの全レベルの認定資格を保有。決済プロダクトの設計から実装まで一貫して支援します。',
          items: [
            'Stripe Certified Professional Developer',
            'Stripe Certified Associate Architect / Developer',
            'Stripe Certified Fundamentals',
          ],
          link: { href: '/ja/about', label: 'プロフィールを見る' },
        },
        {
          title: '技術発信',
          description:
            'Dev.to・Qiita・Zenn・自社ブログで継続的に記事を公開。レイオフやキャリアを含む一次情報も発信しています。',
          items: [
            'Dev.to / Qiita / Zenn でのマルチプラットフォーム発信',
            '元Stripe Developer Advocateとしての実装知見',
            'OSS・npmパッケージの公開とメンテナンス',
          ],
          link: { href: '/ja/writing', label: '記事を読む' },
        },
      ]
    : [
        {
          title: 'Speaking & Conferences',
          description:
            'Speaker and organizing-committee chair at conferences in Japan and abroad, consistently sharing on payments, serverless, and WordPress.',
          items: [
            'Chair, WordCamp Kansai 2024',
            'Chair, JP_Stripes Connect 2019 — the first Stripe user conference in Japan',
            'Frequent speaker across AWS, Stripe, and WordPress communities',
          ],
          link: { href: '/speaking', label: 'View speaking history' },
        },
        {
          title: 'Community Building',
          description:
            'Founded and run several developer communities, focused on building ecosystems and circulating knowledge.',
          items: [
            'Founder of JP_Stripes, the Stripe user community in Japan',
            'wp-kyoto — a technical blog run for over 10 years',
            'AWS Samurai 2017 / Alexa Champions / AWS Community Builders',
          ],
        },
        {
          title: 'Certifications',
          description:
            'Holding Stripe certifications across every level — supporting payment products end to end, from design to implementation.',
          items: [
            'Stripe Certified Professional Developer',
            'Stripe Certified Associate Architect / Developer',
            'Stripe Certified Fundamentals',
          ],
          link: { href: '/about', label: 'View profile' },
        },
        {
          title: 'Technical Writing',
          description:
            'Publishing regularly on Dev.to, Qiita, Zenn, and my own blog, including first-hand notes on layoffs and career.',
          items: [
            'Multi-platform writing on Dev.to / Qiita / Zenn',
            'Implementation insights as a former Stripe Developer Advocate',
            'Publishing and maintaining OSS and npm packages',
          ],
          link: { href: '/writing', label: 'Read articles' },
        },
      ]

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <SectionHeader title={sectionTitle} description={sectionDescription} align="center" />

        <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {highlights.map((highlight) => (
            <HighlightCard key={highlight.title} highlight={highlight} />
          ))}
        </div>
      </Container>
    </section>
  )
}
