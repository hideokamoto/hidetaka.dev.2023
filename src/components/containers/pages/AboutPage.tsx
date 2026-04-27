import Image from 'next/image'
import Link from 'next/link'
import Profile from '@/components/content/Profile'
import SectionHeader from '@/components/ui/SectionHeader'
import { SITE_CONFIG } from '@/config'

function SpeakerProfile({ lang }: { lang: 'ja' | 'en' }) {
  if (lang === 'ja') {
    return (
      <>
        DigitalCubeのBizDevとして、SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦している。前職では
        <a
          style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
          href="https://stripe.com/docs"
        >
          Stripe
        </a>
        のディベロッパーアドボケイトとして、開発者・ユーザーコミュニティとの対話やコンテンツ・サンプルの提供に取り組んだ。ECサービスやSaaSサービスの開発・運用保守の経験とコミュニティとの会話を元に、サービスの収益化戦略やテクノロジー活用方法について情報発信している。複数の開発者コミュニティに参加し、WordCamp
        Kansai 2024やJP_Stripes Connect
        2019など、ユーザーカンファレンスの実行委員長を務めた経験を持つ。 AWS Sumurai 2017, Alexa
        Champions, AWS Community Builders
      </>
    )
  }
  return (
    <>
      Hide (ひで pronounced &quot;Hee-Day&quot;) is a Business Development professional at{' '}
      <a
        style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
        href="https://en.digitalcube.jp/"
      >
        DigitalCube
      </a>
      , where he works on increasing revenue for SaaS and EC sites, exploring efficiency
      improvements using generative AI, and developing new business models. Previously, he was a
      Developer Advocate at{' '}
      <a
        style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
        href="https://stripe.com/docs"
      >
        Stripe
      </a>
      , where he worked on writing, coding, and teaching how to integrate online payments. He has
      organized several community conferences including WordCamp Kansai 2024 and{' '}
      <a
        style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
        href="https://connect2019.jpstripes.com/"
      >
        JP_Stripes Connect 2019
      </a>
      , the first Stripe user conference in Japan. Prior to Stripe, Hide was a lead Software
      Engineer at DigitalCube, focused on building plugins, open source, and developing SaaS
      application dashboards. Hide lives in Hyogo, Japan with his family and two cats.
    </>
  )
}

type ExperienceItem = {
  no: string
  title: string
  period: string
  description: string
  highlights?: string[]
}

function ExperiencePanel({ item }: { item: ExperienceItem }) {
  return (
    <article className="ds-panel">
      <span className="ds-panel__no">{item.no}</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <h3 className="ds-panel__title">{item.title}</h3>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {item.period}
        </span>
      </div>
      <p className="ds-panel__body">{item.description}</p>
      {item.highlights && item.highlights.length > 0 && (
        <ul className="ds-panel__bullets">
          {item.highlights.map((h) => (
            <li key={h} className="ds-panel__bullet">
              {h}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function AboutPageContent({ lang }: { lang: 'ja' | 'en' }) {
  const isJa = lang.startsWith('ja')

  const pageDescription = isJa
    ? 'SaaSやECサイトの収益最大化を支援するエンジニア。Stripe、AWS Serverless、WordPressを専門としています。'
    : 'Engineering partner specializing in Stripe, AWS Serverless, and WordPress. Helping SaaS and e-commerce sites maximize revenue.'

  const experiences: ExperienceItem[] = isJa
    ? [
        {
          no: '01',
          title: 'DigitalCube — Business Development',
          period: '2024 - 現在',
          description:
            'SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦しています。',
          highlights: [
            'SaaS・ECサイトの収益最大化戦略の立案と実行',
            '生成AIを活用した業務効率化と新規事業開発',
            '技術とビジネスの橋渡し',
          ],
        },
        {
          no: '02',
          title: 'Stripe — Developer Advocate',
          period: '2019 - 2024',
          description:
            '開発者・ユーザーコミュニティとの対話やコンテンツ・サンプルの提供に取り組みました。',
          highlights: [
            '開発者向けドキュメントとサンプルコードの作成',
            'コミュニティカンファレンスの企画・運営',
            'オンライン決済のベストプラクティスの情報発信',
          ],
        },
        {
          no: '03',
          title: 'DigitalCube — Lead Software Engineer',
          period: '2015 - 2019',
          description:
            'プラグイン開発、オープンソースプロジェクト、SaaSアプリケーションダッシュボードの開発に従事しました。',
          highlights: [
            'WordPressプラグインとSaaS製品の開発',
            'オープンソースプロジェクトへの貢献',
            'チームリーダーとしての技術的リーダーシップ',
          ],
        },
      ]
    : [
        {
          no: '01',
          title: 'DigitalCube — Business Development',
          period: '2024 - Present',
          description:
            'Working on methods to increase revenue for SaaS and EC sites, exploring efficiency improvements using generative AI, and developing new business models.',
          highlights: [
            'Revenue maximization strategies for SaaS and e-commerce',
            'Generative AI integration for operational efficiency',
            'Bridging technology and business',
          ],
        },
        {
          no: '02',
          title: 'Stripe — Developer Advocate',
          period: '2019 - 2024',
          description:
            'Worked on writing, coding, and teaching how to integrate online payments. Engaged with developer and user communities.',
          highlights: [
            'Created developer documentation and sample code',
            'Organized community conferences',
            'Shared best practices for online payments',
          ],
        },
        {
          no: '03',
          title: 'DigitalCube — Lead Software Engineer',
          period: '2015 - 2019',
          description:
            'Focused on building plugins, open source projects, and developing SaaS application dashboards.',
          highlights: [
            'Developed WordPress plugins and SaaS products',
            'Contributed to open source projects',
            'Technical leadership as team lead',
          ],
        },
      ]

  const certifications = [
    {
      title: 'Stripe Certified Fundamentals',
      link: 'https://stripecertifications.credential.net/07672459-235c-4d15-93ac-09924b3e497e#gs.2entq2',
      src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/75763824',
    },
    {
      title: 'Stripe Certified Associate Architect',
      link: 'https://stripecertifications.credential.net/aaddbb97-48a8-485b-b8fe-762f0755a983?record_view=true#gs.4ueaj3',
      src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/81675136',
    },
    {
      title: 'Stripe Certified Associate Developer',
      link: 'https://stripecertifications.credential.net/a7068cdb-95a4-4c87-86ab-32a5029adf21#gs.2ekxxs',
      src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/76718344',
    },
    {
      title: 'Stripe Certified Professional Developer',
      link: '',
      src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/80541441',
    },
  ]

  const experienceTitle = isJa ? '経歴' : 'Experience'
  const certificationsTitle = isJa ? '認定証' : 'Certifications'
  const connectTitle = isJa ? '連絡先' : 'Connect'
  const moreAboutTitle = isJa ? '詳細プロフィール' : 'More About Me'
  const profileTitle = isJa ? 'プロフィール' : 'Profile'

  return (
    <>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--color-line-strong)' }}>
        <div className="mx-auto max-w-[1440px] px-8 sm:px-16">
          {/* Top bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--color-line)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              Hidetaka.dev / ABOUT
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              {isJa ? 'プロフィール' : 'ABOUT · PROFILE'}
            </span>
          </div>

          {/* Main grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3rem',
              paddingTop: '3rem',
              paddingBottom: '4rem',
            }}
            className="lg:grid-cols-[1fr_320px]"
          >
            {/* Left */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  marginBottom: '1rem',
                }}
              >
                &#9675; {profileTitle}
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 900,
                  fontSize: 'clamp(40px,6vw,80px)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-ink)',
                  marginBottom: '1.5rem',
                }}
              >
                {isJa ? 'Hidetaka\nOkamoto' : 'Hidetaka\nOkamoto'}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-md)',
                  lineHeight: 'var(--leading-loose)',
                  color: 'var(--color-ink-2)',
                  maxWidth: '38em',
                }}
              >
                {pageDescription}
              </p>
              <div
                style={{
                  marginTop: '2rem',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-loose)',
                  color: 'var(--color-ink-2)',
                  maxWidth: '38em',
                }}
              >
                <Profile lang={lang} />
              </div>
            </div>

            {/* Right: portrait */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                border: '1px solid var(--color-line-strong)',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/images/profile.jpg"
                alt="Hidetaka Okamoto"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section style={{ borderBottom: '1px solid var(--color-line-strong)' }}>
        <div className="mx-auto max-w-[1440px] px-8 sm:px-16 py-16">
          <SectionHeader
            no="01"
            title={experienceTitle}
            titleSub={isJa ? 'これまでの経験と専門性' : 'Professional experience and expertise'}
          />

          <div className="ds-panel-grid ds-panel-grid--3" style={{ marginTop: '2rem' }}>
            {experiences.map((exp) => (
              <ExperiencePanel key={exp.no} item={exp} />
            ))}
          </div>

          {/* Additional profile */}
          <div style={{ marginTop: '2rem' }}>
            <article className="ds-panel" style={{ maxWidth: '800px' }}>
              <h3 className="ds-panel__title">{moreAboutTitle}</h3>
              <p className="ds-panel__body">
                <SpeakerProfile lang={lang} />
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ borderBottom: '1px solid var(--color-line-strong)' }}>
        <div className="mx-auto max-w-[1440px] px-8 sm:px-16 py-16">
          <SectionHeader
            no="02"
            title={certificationsTitle}
            titleSub={isJa ? 'Stripe認定資格' : 'Stripe certifications'}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
            {certifications.map((cert) =>
              cert.link ? (
                <a
                  key={cert.title}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={cert.title}
                >
                  <Image src={cert.src} width={120} height={120} alt={cert.title} />
                </a>
              ) : (
                <Image key={cert.title} src={cert.src} width={120} height={120} alt={cert.title} />
              ),
            )}
          </div>
        </div>
      </section>

      {/* Connect */}
      <section>
        <div className="mx-auto max-w-[1440px] px-8 sm:px-16 py-16">
          <SectionHeader
            no="03"
            title={connectTitle}
            titleSub={isJa ? 'SNSやGitHubでフォローしてください' : 'Follow me on social media'}
          />

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}
          >
            <Link
              href={SITE_CONFIG.social.twitter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn--secondary"
              style={{ width: 'fit-content' }}
              aria-label={SITE_CONFIG.social.twitter.ariaLabel}
            >
              Twitter / X →
            </Link>
            <Link
              href={SITE_CONFIG.social.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn--secondary"
              style={{ width: 'fit-content' }}
              aria-label={SITE_CONFIG.social.github.ariaLabel}
            >
              GitHub →
            </Link>
            <Link
              href={SITE_CONFIG.social.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn--secondary"
              style={{ width: 'fit-content' }}
              aria-label={SITE_CONFIG.social.linkedin.ariaLabel}
            >
              LinkedIn →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mx-auto max-w-[1440px] px-8 sm:px-16">
        <div className="ds-cta-block">
          <span className="ds-cta-block__pre">{isJa ? 'お問い合わせ' : 'Get In Touch'}</span>
          <h2 className="ds-cta-block__title">
            {isJa ? (
              <>
                一緒に<em>プロジェクト</em>を<br />
                始めませんか？
              </>
            ) : (
              <>
                Let&apos;s build something
                <br />
                <em>together.</em>
              </>
            )}
          </h2>
          <div className="ds-cta-block__actions">
            <a href="mailto:hello@hidetaka.dev" className="ds-btn ds-btn--primary ds-btn--lg">
              {isJa ? 'メールで相談する' : 'Get in touch'}
            </a>
            <Link
              href={isJa ? '/ja/work' : '/work'}
              className="ds-btn ds-btn--secondary ds-btn--lg"
            >
              {isJa ? '制作物を見る' : 'View my work'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
