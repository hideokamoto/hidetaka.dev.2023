import Container from '@/components/tailwindui/Container'
import RvtCard from '@/components/ui/RvtCard'
import RvtEyebrow from '@/components/ui/RvtEyebrow'
import { getPathnameWithLangType } from '@/libs/urlUtils/lang.util'

type Highlight = {
  title: string
  description: string
  highlights: string[]
  href: string
  cta: string
  index: number
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const eyebrow = `0${highlight.index} / TRACK RECORD`
  return (
    <RvtCard
      eyebrow={eyebrow}
      title={highlight.title}
      description={highlight.description}
      bullets={highlight.highlights}
      cta={highlight.cta}
      href={highlight.href}
      accent="top"
      className="h-full"
    />
  )
}

export default function Highlights({ lang }: { lang: string }) {
  const isJa = lang === 'ja'

  const sectionTitle = isJa ? '実績とコミュニティ活動' : 'Track Record & Community'
  const sectionDescription = isJa
    ? 'Stripeでの5年、複数カンファレンスの実行委員長、10年以上運営する技術メディア、公開してきたプロダクト群です。'
    : "Five years at Stripe, chairing multiple community conferences, a decade-plus running a technical publication, and products I've built and kept running."

  const items: Omit<Highlight, 'index'>[] = isJa
    ? [
        {
          title: '元Stripe Developer Advocate',
          description:
            '2019年から2024年まで、Stripeのディベロッパーアドボケイトとして開発者・ユーザーコミュニティとの対話やドキュメント・サンプルコードの提供に取り組みました。Stripe認定資格4種を保有しています。',
          highlights: [
            'Stripe Certified Fundamentals / Associate Architect / Associate Developer / Professional Developer',
            'オンライン決済のベストプラクティスを情報発信',
          ],
          href: getPathnameWithLangType('about', lang),
          cta: '経歴を見る',
        },
        {
          title: 'コミュニティ運営の実行委員長',
          description:
            'WordCamp Kansai 2024の実行委員長、および日本初のStripeユーザーカンファレンス「JP_Stripes Connect 2019」の実行委員長を務めました。AWS Samurai 2017、Alexa Champions、AWS Community Buildersにも選出されています。',
          highlights: [
            'WordCamp Kansai 2024 実行委員長',
            'JP_Stripes Connect 2019 実行委員長（日本初のStripeユーザーカンファレンス）',
            'AWS Samurai 2017 / Alexa Champions / AWS Community Builders',
          ],
          href: getPathnameWithLangType('speaking', lang),
          cta: '講演歴を見る',
        },
        {
          title: '技術メディア wp-kyoto.net',
          description:
            'WordPress関連の技術メディア「wp-kyoto.net」を10年以上に渡って運営し、記事・コード例を継続的に発信しています。',
          highlights: ['10年以上の継続運用', 'WordPress開発者向けの技術記事とコード例'],
          href: 'https://wp-kyoto.net',
          cta: 'wp-kyoto.netを見る',
        },
        {
          title: 'OSS・プロダクト開発',
          description:
            'WordPressプラグイン、npmパッケージ、eorzea-weatherなどのWebアプリケーションを開発・公開しています。',
          highlights: [
            'WordPressプラグインの開発・公開',
            'npmパッケージの開発・公開',
            'eorzea-weather等のWebアプリ開発',
          ],
          href: getPathnameWithLangType('work', lang),
          cta: '作品を見る',
        },
      ]
    : [
        {
          title: 'Former Stripe Developer Advocate',
          description:
            'From 2019 to 2024, I worked as a Developer Advocate at Stripe, engaging with developer and user communities and creating documentation and sample code. I hold all four Stripe certifications.',
          highlights: [
            'Stripe Certified Fundamentals / Associate Architect / Associate Developer / Professional Developer',
            'Published best practices for online payments',
          ],
          href: getPathnameWithLangType('about', lang),
          cta: 'View background',
        },
        {
          title: 'Community Conference Chair',
          description:
            'I chaired WordCamp Kansai 2024 and JP_Stripes Connect 2019, the first Stripe user conference in Japan. I have also been recognized as an AWS Samurai 2017, Alexa Champion, and AWS Community Builder.',
          highlights: [
            'Chair, WordCamp Kansai 2024',
            'Chair, JP_Stripes Connect 2019 (the first Stripe user conference in Japan)',
            'AWS Samurai 2017 / Alexa Champions / AWS Community Builders',
          ],
          href: getPathnameWithLangType('speaking', lang),
          cta: 'View speaking history',
        },
        {
          title: 'wp-kyoto.net, running 10+ years',
          description:
            'I have run wp-kyoto.net, a WordPress-focused technical media outlet, for over a decade, publishing articles and code examples continuously.',
          highlights: [
            '10+ years of continuous publishing',
            'Technical articles and code for WordPress developers',
          ],
          href: 'https://wp-kyoto.net',
          cta: 'Visit wp-kyoto.net',
        },
        {
          title: 'OSS & shipped products',
          description:
            'I build and publish WordPress plugins, npm packages, and web apps such as eorzea-weather.',
          highlights: [
            'WordPress plugins, published and maintained',
            'npm packages, published and maintained',
            'Web apps such as eorzea-weather',
          ],
          href: getPathnameWithLangType('work', lang),
          cta: 'View work',
        },
      ]

  return (
    <section
      style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--rvt-border)' }}
      className="py-24 sm:py-32"
    >
      <Container>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <RvtEyebrow className="mb-5">TRACK RECORD</RvtEyebrow>
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
          {items.map((item, i) => (
            <HighlightCard key={item.title} highlight={{ ...item, index: i + 1 }} />
          ))}
        </div>
      </Container>
    </section>
  )
}
