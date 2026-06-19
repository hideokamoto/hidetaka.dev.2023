import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import SocialLink from '@/components/tailwindui/SocialLink'
import ProfileImage from '@/components/ui/ProfileImage'
import RvtButton from '@/components/ui/RvtButton'
import RvtEyebrow from '@/components/ui/RvtEyebrow'
import { SITE_CONFIG } from '@/config'

export default function Hero({ lang }: { lang: string }) {
  const name = SITE_CONFIG.author.name
  const role = 'Developer Experience Engineer'
  const tagline =
    lang === 'ja'
      ? 'シームレスな体験で開発者をエンパワーする'
      : 'Empowering developers with seamless experiences'

  const description =
    lang === 'ja'
      ? 'Stripe、AWS Serverless、WordPressを専門とする開発者。EC ASP開発とStripe Developer Advocateとしての経験を活かし、SaaS・ECサイトの収益最大化を支援します。'
      : 'Engineering partner specializing in Stripe, AWS Serverless, and WordPress. Leveraging experience in EC ASP development and as a Stripe Developer Advocate to help SaaS and e-commerce sites maximize revenue.'

  const ctaText = lang === 'ja' ? 'プロジェクトを見る' : 'View my projects'
  const ctaHref = lang === 'ja' ? '/ja/work' : '/work'
  const blogHref = lang === 'ja' ? '/ja/blog' : '/blog'
  const blogText = lang === 'ja' ? 'ブログを読む' : 'Read the blog'

  const stats = [
    {
      value: '10+',
      label: lang === 'ja' ? 'OSSプロジェクト' : 'OSS projects',
    },
    {
      value: '4+',
      label: lang === 'ja' ? 'Stripe npm パッケージ' : 'Stripe npm packages',
    },
    {
      value: '5+',
      label: lang === 'ja' ? '年間の登壇実績' : 'years speaking',
    },
    {
      value: '2',
      label: lang === 'ja' ? 'Stripe Apps 公開中' : 'Stripe Apps live',
    },
  ]

  return (
    <section
      style={{ position: 'relative', overflow: 'hidden', zIndex: 1 }}
      className="-mt-[var(--header-height)] pt-[var(--header-height)]"
    >
      {/* Accent glow orbs */}
      <div
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--rvt-accent-glow) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          bottom: -100,
          left: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--rvt-accent2) 15%, transparent) 0%, transparent 65%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16 lg:gap-20">
          {/* Left: Content */}
          <div
            className="flex-1 lg:max-w-2xl"
            style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <RvtEyebrow>{role}</RvtEyebrow>

              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--rvt-font-display)',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.06em',
                  color: 'var(--rvt-fg)',
                }}
              >
                {name}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                  fontWeight: 500,
                  color: 'var(--rvt-accent)',
                  fontFamily: 'var(--rvt-font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                {tagline}
              </p>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.8,
                color: 'var(--rvt-fg2)',
                maxWidth: 520,
              }}
            >
              {description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <RvtButton href={ctaHref} variant="primary" arrow>
                {ctaText}
              </RvtButton>
              <RvtButton href={blogHref} variant="secondary">
                {blogText}
              </RvtButton>
              <div className="flex items-center gap-5 ml-2">
                <SocialLink
                  href={SITE_CONFIG.social.twitter.url}
                  aria-label={SITE_CONFIG.social.twitter.ariaLabel}
                  icon={TwitterIcon}
                >
                  <span className="sr-only">{SITE_CONFIG.social.twitter.ariaLabel}</span>
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

            {/* Stat tiles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                paddingTop: 16,
                borderTop: '1px solid var(--rvt-border)',
              }}
              className="grid-cols-2 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: 'var(--rvt-font-display)',
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      letterSpacing: '-0.04em',
                      color: 'var(--rvt-fg)',
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--rvt-font-mono)',
                      fontSize: '11px',
                      color: 'var(--rvt-fg2)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Profile image */}
          <ProfileImage src="/images/profile.jpg" alt={name} size="lg" />
        </div>
      </div>
    </section>
  )
}
