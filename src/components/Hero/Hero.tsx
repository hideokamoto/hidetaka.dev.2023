import SocialLink from '@/components/tailwindui/SocialLink'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import ProfileImage from '@/components/ui/ProfileImage'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'

export default function Hero({ lang }: { lang: string }) {
  const name = 'Hidetaka Okamoto'
  const role = lang === 'ja' ? '開発者' : 'Developer'
  const tagline = lang === 'ja'
    ? 'SaaSの収益を最大化するエンジニアリング'
    : 'Engineering that maximizes SaaS revenue'
  
  const description = lang === 'ja'
    ? 'Stripe、AWS Serverless、WordPressを専門とする開発者。EC ASP開発とStripe Developer Advocateとしての経験を活かし、SaaS・ECサイトの収益最大化を支援します。'
    : 'Engineering partner specializing in Stripe, AWS Serverless, and WordPress. Leveraging experience in EC ASP development and as a Stripe Developer Advocate to help SaaS and e-commerce sites maximize revenue.'
  
  const ctaText = lang === 'ja' ? 'プロジェクトを見る' : 'View my projects'
  const ctaHref = lang === 'ja' ? '/ja/work' : '/work'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-zinc-900 dark:via-indigo-950/30 dark:to-purple-950/20 -mt-[var(--header-height)] pt-[var(--header-height)]">
      <BackgroundDecoration variant="hero" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-20">
          {/* Left: Content */}
          <div className="flex-1 space-y-10 lg:max-w-2xl">
            <div className="space-y-6">
              <Badge label={role} variant="indigo" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900 dark:text-white">
                {name}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {tagline}
              </p>
            </div>

            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <CTAButton href={ctaHref}>
                {ctaText}
              </CTAButton>
              <div className="flex items-center gap-5">
                <SocialLink
                  href="https://twitter.com/hidetaka_dev"
                  aria-label="Follow on Twitter"
                  icon={TwitterIcon}
                >
                  <span className="sr-only">Follow on Twitter</span>
                </SocialLink>
                <SocialLink
                  href="https://github.com/hideokamoto"
                  aria-label="Follow on GitHub"
                  icon={GitHubIcon}
                >
                  <span className="sr-only">Follow on GitHub</span>
                </SocialLink>
                <SocialLink
                  href="https://www.linkedin.com/in/hideokamoto/"
                  aria-label="Follow on LinkedIn"
                  icon={LinkedInIcon}
                >
                  <span className="sr-only">Follow on LinkedIn</span>
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <ProfileImage src="/images/profile.jpg" alt={name} size="lg" />
        </div>
      </div>
    </section>
  )
}
