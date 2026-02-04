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
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
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
        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
        href="https://en.digitalcube.jp/"
      >
        DigitalCube
      </a>
      , where he works on increasing revenue for SaaS and EC sites, exploring efficiency
      improvements using generative AI, and developing new business models. Previously, he was a
      Developer Advocate at{' '}
      <a
        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
        href="https://stripe.com/docs"
      >
        Stripe
      </a>
      , where he worked on writing, coding, and teaching how to integrate online payments. He has
      organized several community conferences including WordCamp Kansai 2024 and{' '}
      <a
        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
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

type ExperienceCardProps = {
  title: string
  period: string
  description: string
  highlights?: string[]
}

function ExperienceCard({ title, period, description, highlights }: ExperienceCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:shadow-md hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {period}
        </span>
      </div>
      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-400 mb-6">
        {description}
      </p>
      {highlights && highlights.length > 0 && (
        <ul className="mt-auto space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
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

  const certificationsTitle = isJa ? '認定証' : 'Certifications'
  const experienceTitle = isJa ? '経歴' : 'Experience'
  const connectTitle = isJa ? '連絡先' : 'Connect'

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 dark:from-zinc-900 dark:via-indigo-950/30 dark:to-purple-950/20 -mt-[var(--header-height)] pt-[var(--header-height)]">
        <BackgroundDecoration variant="hero" />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-20">
            {/* Left: Content */}
            <div className="flex-1 space-y-8 lg:max-w-2xl">
              <PageHeader title={pageTitle} description={pageDescription} />
              <div className="space-y-6 text-base leading-relaxed text-slate-600 dark:text-slate-400">
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
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
                {isJa ? '詳細プロフィール' : 'More About Me'}
              </h3>
              <div className="space-y-6 text-base leading-relaxed text-slate-700 dark:text-slate-400">
                <SpeakerProfile lang={lang} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Certifications Section */}
      <section className="relative py-24 sm:py-32 bg-white dark:bg-zinc-900">
        <Container>
          <SectionHeader
            title={certificationsTitle}
            description={isJa ? 'Stripe認定資格' : 'Stripe certifications'}
            align="center"
          />

          <div className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-10">
            {certifications.map((cert) => (
              <CertificationBadge key={cert.title} {...cert} />
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
