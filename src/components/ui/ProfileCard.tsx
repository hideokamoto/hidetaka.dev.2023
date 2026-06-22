import type { ReactNode } from 'react'
import { SITE_CONFIG } from '@/config'
import Profile from '../content/Profile'
import GitHubIcon from '../tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '../tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '../tailwindui/SocialIcons/Twitter'
import ProfileImage from './ProfileImage'

type ProfileCardProps = {
  lang: 'ja' | 'en'
  showImage?: boolean
  showSocial?: boolean
  className?: string
  imageSrc?: string
  imageSize?: 'sm' | 'md' | 'lg' | 'responsive'
}

const SOCIAL_LINKS = [
  {
    href: SITE_CONFIG.social.twitter.url,
    icon: TwitterIcon,
    label: SITE_CONFIG.social.twitter.label,
    ariaLabel: SITE_CONFIG.social.twitter.ariaLabel,
  },
  {
    href: SITE_CONFIG.social.github.url,
    icon: GitHubIcon,
    label: SITE_CONFIG.social.github.label,
    ariaLabel: SITE_CONFIG.social.github.ariaLabel,
  },
  {
    href: SITE_CONFIG.social.linkedin.url,
    icon: LinkedInIcon,
    label: SITE_CONFIG.social.linkedin.label,
    ariaLabel: SITE_CONFIG.social.linkedin.ariaLabel,
  },
] as const

function SocialLink({
  href,
  icon: Icon,
  label,
  ariaLabel,
}: {
  href: string
  icon: ({ className }: { className?: string }) => ReactNode
  label: string
  ariaLabel: string
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600"
      style={{ color: 'var(--rvt-fg2)' }}
    >
      <Icon className="h-5 w-5 flex-none fill-[var(--rvt-fg3)] transition-colors group-hover:fill-indigo-600" />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </a>
  )
}

export default function ProfileCard({
  lang,
  showImage = true,
  showSocial = true,
  className = '',
  imageSrc = '/me.jpg',
  imageSize = 'md',
}: ProfileCardProps) {
  const authorName = SITE_CONFIG.author.name

  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-sm ${className}`}
      style={{
        border: '1px solid var(--rvt-border)',
        background: 'var(--rvt-bg2)',
      }}
    >
      <div className="flex flex-col gap-6">
        {showImage && (
          <div>
            <ProfileImage src={imageSrc} alt={`${authorName} profile photo`} size={imageSize} />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
              {authorName}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--rvt-fg2)' }}>
              Developer Experience Engineer
            </p>
          </div>

          <div className="text-sm leading-relaxed" style={{ color: 'var(--rvt-fg2)' }}>
            <Profile lang={lang} />
          </div>

          {showSocial && (
            <div className="flex flex-wrap gap-4 pt-2">
              {SOCIAL_LINKS.map((link) => (
                <SocialLink key={link.href} {...link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
