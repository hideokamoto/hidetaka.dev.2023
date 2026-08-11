import type { ReactNode } from 'react'
import type { Profile, ProfileSocialNetwork } from '@/libs/profile/types'
import GitHubIcon from '../tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '../tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '../tailwindui/SocialIcons/Twitter'
import ProfileImage from './ProfileImage'

type ProfileCardProps = {
  /** Profile data. Fetch it with `ProfileCardLoader` rather than wiring this by hand. */
  profile: Profile
  showImage?: boolean
  showSocial?: boolean
  className?: string
  imageSrc?: string
  imageSize?: 'sm' | 'md' | 'lg' | 'responsive'
}

/**
 * Presentation metadata for the networks this card renders.
 *
 * Icons and their accessible labels belong to the UI, not to the profile document — upstream
 * only supplies `sameAs` URLs. Networks absent from this map (personal blog, the site itself)
 * have no icon and are not rendered here.
 */
const NETWORK_META: Partial<
  Record<
    ProfileSocialNetwork,
    { icon: ({ className }: { className?: string }) => ReactNode; label: string; ariaLabel: string }
  >
> = {
  twitter: { icon: TwitterIcon, label: 'Twitter', ariaLabel: 'Follow on Twitter' },
  github: { icon: GitHubIcon, label: 'GitHub', ariaLabel: 'Follow on GitHub' },
  linkedin: { icon: LinkedInIcon, label: 'LinkedIn', ariaLabel: 'Follow on LinkedIn' },
}

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
  profile,
  showImage = true,
  showSocial = true,
  className = '',
  imageSrc = '/me.jpg',
  imageSize = 'md',
}: ProfileCardProps) {
  const socialLinks = profile.social.flatMap((link) => {
    const meta = NETWORK_META[link.network]
    return meta ? [{ href: link.url, ...meta }] : []
  })

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
            <ProfileImage src={imageSrc} alt={`${profile.name} profile photo`} size={imageSize} />
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
              {profile.name}
            </h3>
            {profile.jobTitle && (
              <p className="mt-1 text-sm" style={{ color: 'var(--rvt-fg2)' }}>
                {profile.jobTitle}
              </p>
            )}
          </div>

          {profile.description && (
            <div className="text-sm leading-relaxed" style={{ color: 'var(--rvt-fg2)' }}>
              <p>{profile.description}</p>
            </div>
          )}

          {showSocial && socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {socialLinks.map((link) => (
                <SocialLink key={link.href} {...link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
