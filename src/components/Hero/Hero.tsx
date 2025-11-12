import Image from 'next/image'
import Link from 'next/link'
import SocialLink from '@/components/tailwindui/SocialLink'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'

export default function Hero({ lang }: { lang: string }) {
  const name = 'Hidetaka Okamoto'
  const role = lang === 'ja' ? '開発パートナー' : 'Engineering Partner'
  const tagline = lang === 'ja'
    ? 'SaaSの収益を最大化するエンジニアリング'
    : 'Engineering that maximizes SaaS revenue'
  
  const description = lang === 'ja'
    ? 'Stripe、AWS Serverless、WordPressを専門とする開発パートナー。EC ASP開発とStripe Developer Advocateとしての経験を活かし、SaaS・ECサイトの収益最大化を支援します。'
    : 'Engineering partner specializing in Stripe, AWS Serverless, and WordPress. Leveraging experience in EC ASP development and as a Stripe Developer Advocate to help SaaS and e-commerce sites maximize revenue.'
  
  const ctaText = lang === 'ja' ? 'プロジェクトを始める' : 'Start a project'
  const ctaHref = lang === 'ja' ? '/ja/work' : '/work'

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-16">
          {/* Left: Content */}
          <div className="flex-1 space-y-8 lg:max-w-2xl">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {role}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white">
                {name}
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                {tagline}
              </p>
            </div>

            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href={ctaHref}
                className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {ctaText}
              </Link>
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
          <div className="flex-shrink-0 lg:w-80">
            <div className="relative aspect-square w-full max-w-xs mx-auto lg:mx-0">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-2xl dark:from-indigo-900/20 dark:to-purple-900/20" />
              <div className="relative h-full w-full rounded-3xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-lg">
                <Image
                  src="/images/profile.jpg"
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
