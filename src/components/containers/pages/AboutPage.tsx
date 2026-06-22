import Image from 'next/image'
import Profile from '@/components/content/Profile'
import Container from '@/components/tailwindui/Container'
import SocialLink, {
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
} from '@/components/tailwindui/SocialLink'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import PageHeader from '@/components/ui/PageHeader'
import ProfileImage from '@/components/ui/ProfileImage'
import SectionHeader from '@/components/ui/SectionHeader'
import { SITE_CONFIG } from '@/config'

function SpeakerProfile({ lang }: { lang: 'ja' | 'en' }) {
  if (lang === 'ja') {
    return (
      <>
        DigitalCubeのBizDevとして、SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦している。前職では
        <a
          className="underline hover:opacity-80"
          style={{ color: 'var(--rvt-accent)' }}
          href="https://stripe.com/docs"
        >
          Stripe
        </a>
        のディベロッパーアドボケイトとして、開発者・ユーザーコミュニティとの対話やコンテンツ・サンプルの提供に取り組んだ。ECサービスやSaaSサービスの開発・運用保守の経験とコミュニティとの会話を元に、サービスの収益化戦略やテクノロジー活用方法について情報発信している。複数の開発者コミュニティに参加し、WordCamp
        Kansai 2024やJP_Stripes Connect
        2019など、ユーザーカンファレンスの実行委員長を務めた経験を持つ。 AWS Samurai 2017, Alexa
        Champions, AWS Community Builders
      </>
    )
  }
  return (
    <>
      Hide (ひで pronounced &quot;Hee-Day&quot;) is a Business Development professional at{' '}
      <a
        className="underline hover:opacity-80"
        style={{ color: 'var(--rvt-accent)' }}
        href="https://en.digitalcube.jp/"
      >
        DigitalCube
      </a>
      , where he works on increasing revenue for SaaS and EC sites, exploring efficiency
      improvements using generative AI, and developing new business models. Previously, he was a
      Developer Advocate at{' '}
      <a
        className="underline hover:opacity-80"
        style={{ color: 'var(--rvt-accent)' }}
        href="https://stripe.com/docs"
      >
        Stripe
      </a>
      , where he worked on writing, coding, and teaching how to integrate online payments. He has
      organized several community conferences including WordCamp Kansai 2024 and{' '}
      <a
        className="underline hover:opacity-80"
        style={{ color: 'var(--rvt-accent)' }}
        href="https://connect2019.jpstripes.com/"
      >
        JP_Stripes Connect 2019
      </a>
      , the first Stripe user conference in Japan. Prior to Stripe, Hide was a lead Software
      Engineer at DigitalCube, focused on building plugins, open source, and developing SaaS
      application dashboards. He is also recognized as an AWS Samurai 2017, Alexa Champion, and AWS
      Community Builder. Hide lives in Hyogo, Japan with his family and two cats.
    </>
  )
}

type ExperienceCardProps = {
  title: string
  period: string
  description: string
  highlights?: string[]
}

function ExperienceCard({ title, period, description, highlights }: ExperienceCardProps) {
  return (
    <article
      className="group relative flex h-full flex-col rounded-2xl p-8 transition-all hover:shadow-md hover:border-indigo-300"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
        >
          {title}
        </h3>
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--rvt-fg2)' }}>
          {period}
        </span>
      </div>
      <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--rvt-fg2)' }}>
        {description}
      </p>
      {highlights && highlights.length > 0 && (
        <ul className="mt-auto space-y-3 text-sm leading-6" style={{ color: 'var(--rvt-fg2)' }}>
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <span
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: 'var(--rvt-accent)' }}
              />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function CertificationBadge({ title, link, src }: { title: string; link?: string; src: string }) {
  const content = (
    <div className="group relative transition-transform hover:scale-105">
      <Image
        src={src}
        width={120}
        height={120}
        alt={title}
        className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
      />
    </div>
  )

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block" aria-label={title}>
        {content}
      </a>
    )
  }

  return content
}

const RECOGNITIONS = [
  { title: 'AWS Samurai 2017', issuer: 'Amazon Web Services' },
  { title: 'Alexa Champions', issuer: 'Amazon Alexa' },
  { title: 'AWS Community Builders', issuer: 'Amazon Web Services' },
]

function RecognitionBadge({ title, issuer }: { title: string; issuer: string }) {
  return (
    <div
      className="flex w-full sm:w-64 flex-col items-center rounded-xl px-6 py-4 text-center shadow-sm transition-all hover:scale-105 hover:shadow-md"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <span className="text-base font-semibold" style={{ color: 'var(--rvt-fg)' }}>
        {title}
      </span>
      <span className="mt-1 text-sm" style={{ color: 'var(--rvt-fg2)' }}>
        {issuer}
      </span>
    </div>
  )
}

export default function AboutPageContent({ lang }: { lang: 'ja' | 'en' }) {
  const isJa = lang.startsWith('ja')

  const pageTitle = isJa ? 'Hidetaka Okamotoについて' : 'About Hidetaka Okamoto'
  const pageDescription = isJa
    ? 'SaaSやECサイトの収益最大化を支援するエンジニア。Stripe、AWS Serverless、WordPressを専門としています。'
    : 'Engineering partner specializing in Stripe, AWS Serverless, and WordPress. Helping SaaS and e-commerce sites maximize revenue.'

  const experiences: ExperienceCardProps[] = isJa
    ? [
        {
          title: 'DigitalCube - Business Development',
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
          title: 'Stripe - Developer Advocate',
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
          title: 'DigitalCube - Lead Software Engineer',
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
          title: 'DigitalCube - Business Development',
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
          title: 'Stripe - Developer Advocate',
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
          title: 'DigitalCube - Lead Software Engineer',
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

  const certificationsTitle = isJa ? '認定・受賞' : 'Certifications & Recognition'
  const experienceTitle = isJa ? '経歴' : 'Experience'
  const connectTitle = isJa ? '連絡先' : 'Connect'

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden -mt-[var(--header-height)] pt-[var(--header-height)]"
        style={{ background: 'var(--rvt-bg)' }}
      >
        <BackgroundDecoration variant="hero" />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-20">
            {/* Left: Content */}
            <div className="flex-1 space-y-8 lg:max-w-2xl">
              <PageHeader title={pageTitle} description={pageDescription} />
              <div
                className="space-y-6 text-base leading-relaxed"
                style={{ color: 'var(--rvt-fg2)' }}
              >
                <Profile lang={lang} />
              </div>
            </div>

            {/* Right: Image */}
            <ProfileImage src="/images/profile.jpg" alt="Hidetaka Okamoto" size="lg" />
          </div>
        </Container>
      </section>

      {/* Experience Section */}
      <section className="relative py-24 sm:py-32">
        <Container>
          <SectionHeader
            title={experienceTitle}
            description={isJa ? 'これまでの経験と専門性' : 'Professional experience and expertise'}
            align="center"
          />

          <div className="mt-20 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.title} {...experience} />
            ))}
          </div>

          {/* Additional Profile */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div
              className="rounded-2xl p-10"
              style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
            >
              <h3
                className="text-xl font-semibold tracking-tight mb-6"
                style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
              >
                {isJa ? '詳細プロフィール' : 'More About Me'}
              </h3>
              <div
                className="space-y-6 text-base leading-relaxed"
                style={{ color: 'var(--rvt-fg2)' }}
              >
                <SpeakerProfile lang={lang} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Certifications Section */}
      <section className="relative py-24 sm:py-32" style={{ background: 'var(--rvt-bg2)' }}>
        <Container>
          <SectionHeader
            title={certificationsTitle}
            description={
              isJa
                ? '認定資格とコミュニティでの評価・受賞歴'
                : 'Certifications and community recognition'
            }
            align="center"
          />

          {/* Stripe Certifications */}
          <h3
            className="mt-16 text-center text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
          >
            {isJa ? 'Stripe 認定資格' : 'Stripe Certifications'}
          </h3>
          <div className="mt-8 flex flex-wrap justify-center gap-8 lg:gap-10">
            {certifications.map((cert) => (
              <CertificationBadge key={cert.title} {...cert} />
            ))}
          </div>

          {/* Community Recognition */}
          <h3
            className="mt-16 text-center text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
          >
            {isJa ? 'コミュニティでの評価・受賞' : 'Community Recognition'}
          </h3>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {RECOGNITIONS.map((recognition) => (
              <RecognitionBadge key={recognition.title} {...recognition} />
            ))}
          </div>
        </Container>
      </section>

      {/* Connect Section */}
      <section className="relative py-24 sm:py-32">
        <Container>
          <SectionHeader
            title={connectTitle}
            description={isJa ? 'SNSやGitHubでフォローしてください' : 'Follow me on social media'}
            align="center"
          />

          <div className="mt-16 flex justify-center">
            <ul className="space-y-6">
              <SocialLink
                href={SITE_CONFIG.social.twitter.url}
                icon={TwitterIcon}
                aria-label={SITE_CONFIG.social.twitter.ariaLabel}
              >
                {isJa ? 'Twitterでフォロー' : 'Follow on Twitter'}
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.github.url}
                icon={GitHubIcon}
                aria-label={SITE_CONFIG.social.github.ariaLabel}
              >
                {isJa ? 'GitHubでフォロー' : 'Follow on GitHub'}
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.linkedin.url}
                icon={LinkedInIcon}
                aria-label={SITE_CONFIG.social.linkedin.ariaLabel}
              >
                {isJa ? 'LinkedInでフォロー' : 'Follow on LinkedIn'}
              </SocialLink>
            </ul>
          </div>
        </Container>
      </section>
    </>
  )
}
