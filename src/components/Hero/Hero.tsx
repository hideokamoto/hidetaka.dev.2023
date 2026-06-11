import BlueskyIcon from '@/components/tailwindui/SocialIcons/Bluesky'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import SocialLink from '@/components/tailwindui/SocialLink'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import Badge from '@/components/ui/Badge'
import CTAButton from '@/components/ui/CTAButton'
import ProfileImage from '@/components/ui/ProfileImage'
import { SITE_CONFIG } from '@/config'

export default function Hero({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')
  const name = SITE_CONFIG.author.name
  const role = 'Developer Advocate · Community Organizer'
  const tagline =
    lang === 'ja'
      ? 'シームレスな体験で開発者をエンパワーする'
      : 'Empowering developers with seamless experiences'

  const description = isJa
    ? '元Stripe Developer Advocate。Stripe・AWS Serverless・WordPressについて発信し、WordCamp KansaiやJP_Stripesなどの開発者コミュニティを運営しています。'
    : 'Former Stripe Developer Advocate writing about Stripe, AWS Serverless, and WordPress — and organizing developer communities like WordCamp Kansai and JP_Stripes.'

  const primaryCta = {
    text: isJa ? '記事を読む' : 'Read my writing',
    href: isJa ? '/ja/writing' : '/writing',
  }
  const secondaryCta = {
    text: isJa ? '登壇・実績' : 'Speaking & work',
    href: isJa ? '/ja/speaking' : '/speaking',
  }

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
              <div className="flex flex-wrap items-center gap-4">
                <CTAButton href={primaryCta.href}>{primaryCta.text}</CTAButton>
                <CTAButton href={secondaryCta.href} variant="outline">
                  {secondaryCta.text}
                </CTAButton>
              </div>
              <div className="flex items-center gap-5">
                <SocialLink
                  href={SITE_CONFIG.social.twitter.url}
                  aria-label={SITE_CONFIG.social.twitter.ariaLabel}
                  icon={TwitterIcon}
                >
                  <span className="sr-only">{SITE_CONFIG.social.twitter.ariaLabel}</span>
                </SocialLink>
                <SocialLink
                  href={SITE_CONFIG.social.bluesky.url}
                  aria-label={SITE_CONFIG.social.bluesky.ariaLabel}
                  icon={BlueskyIcon}
                >
                  <span className="sr-only">{SITE_CONFIG.social.bluesky.ariaLabel}</span>
                </SocialLink>
                <SocialLink
                  href={SITE_CONFIG.social.github.url}
                  aria-label={SITE_CONFIG.social.github.ariaLabel}
                  icon={GitHubIcon}
                >
                  <span className="sr-only">{SITE_CONFIG.social.github.ariaLabel}</span>
                </SocialLink>
                <SocialLink
                  href={SITE_CONFIG.social.linkedin.url}
                  aria-label={SITE_CONFIG.social.linkedin.ariaLabel}
                  icon={LinkedInIcon}
                >
                  <span className="sr-only">{SITE_CONFIG.social.linkedin.ariaLabel}</span>
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
