import Image from 'next/image'
import Link from 'next/link'
import SocialLink from '@/components/tailwindui/SocialLink'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'

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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/15" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-900/10" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-20">
          {/* Left: Content */}
          <div className="flex-1 space-y-10 lg:max-w-2xl">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 backdrop-blur-sm shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  {role}
                </p>
              </div>
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
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {ctaText}
                <span className="transition-transform group-hover:translate-x-1">→</span>
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
          <div className="flex-shrink-0 lg:w-96">
            <div className="relative aspect-square w-full max-w-sm mx-auto lg:mx-0">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-300/50 via-purple-300/40 to-cyan-300/30 blur-3xl dark:from-indigo-500/30 dark:via-purple-500/20 dark:to-cyan-500/15" />
              {/* Border glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-300/60 via-purple-300/50 to-cyan-300/40 blur-xl opacity-60" />
              {/* Image container */}
              <div className="relative h-full w-full rounded-3xl overflow-hidden border-4 border-white/90 shadow-2xl backdrop-blur-sm dark:border-white/10">
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
