'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/config'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'
import GitHubIcon from './SocialIcons/GitHub'
import LinkedInIcon from './SocialIcons/LinkedIn'
import TwitterIcon from './SocialIcons/Twitter'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors hover:text-indigo-600"
      style={{ color: 'var(--rvt-fg2)' }}
    >
      {children}
    </Link>
  )
}

function InnerContainer({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative px-4 sm:px-8 lg:px-12 ${className}`}>
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
}

function OuterContainer({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`sm:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
    </div>
  )
}

export default function Footer() {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)

  return (
    <footer className="relative mt-32 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--rvt-accent-glow) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: '25%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--rvt-accent2) 12%, transparent) 0%, transparent 70%)',
          }}
        />
      </div>

      <OuterContainer>
        <div className="relative pt-16 pb-20" style={{ borderTop: '1px solid var(--rvt-border)' }}>
          <InnerContainer>
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg)' }}
                  >
                    Navigation
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <NavLink href={getPathnameWithLangType('about', lang)}>
                      {lang === 'ja' ? '概要' : 'About'}
                    </NavLink>
                    <NavLink href={getPathnameWithLangType('work', lang)}>
                      {lang === 'ja' ? '制作物' : 'Work'}
                    </NavLink>
                    <NavLink href={getPathnameWithLangType('writing', lang)}>
                      {lang === 'ja' ? '執筆' : 'Writing'}
                    </NavLink>
                    <NavLink href={getPathnameWithLangType('blog', lang)}>
                      {lang === 'ja' ? 'ブログ' : 'Blog'}
                    </NavLink>
                    <NavLink href={getPathnameWithLangType('speaking', lang)}>
                      {lang === 'ja' ? '登壇' : 'Speaking'}
                    </NavLink>
                    <NavLink href={getPathnameWithLangType('privacy', lang)}>
                      {lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
                    </NavLink>
                  </nav>
                </div>

                <div className="flex flex-col gap-6">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg)' }}
                  >
                    Language
                  </h3>
                  <nav className="flex flex-col gap-4">
                    <NavLink href={changeLanguageURL(pathname, 'ja')}>
                      {lang === 'ja' ? '日本語' : 'Japanese'}
                    </NavLink>
                    <NavLink href={changeLanguageURL(pathname, 'en')}>
                      {lang === 'ja' ? '英語' : 'English'}
                    </NavLink>
                  </nav>
                </div>

                <div className="flex flex-col gap-6">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg)' }}
                  >
                    Connect
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {[
                      {
                        href: SITE_CONFIG.social.twitter.url,
                        ariaLabel: SITE_CONFIG.social.twitter.ariaLabel,
                        label: SITE_CONFIG.social.twitter.label,
                        Icon: TwitterIcon,
                      },
                      {
                        href: SITE_CONFIG.social.github.url,
                        ariaLabel: SITE_CONFIG.social.github.ariaLabel,
                        label: SITE_CONFIG.social.github.label,
                        Icon: GitHubIcon,
                      },
                      {
                        href: SITE_CONFIG.social.linkedin.url,
                        ariaLabel: SITE_CONFIG.social.linkedin.ariaLabel,
                        label: SITE_CONFIG.social.linkedin.label,
                        Icon: LinkedInIcon,
                      },
                    ].map(({ href, ariaLabel, label, Icon }) => (
                      <li key={href}>
                        <a
                          href={href}
                          aria-label={ariaLabel}
                          className="group flex items-center gap-3 text-sm font-medium transition-colors hover:text-indigo-600"
                          style={{ color: 'var(--rvt-fg2)' }}
                        >
                          <Icon className="h-5 w-5 flex-none fill-[var(--rvt-fg3)] transition-colors group-hover:fill-indigo-600" />
                          <span>{label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8" style={{ borderTop: '1px solid var(--rvt-border)' }}>
                <p className="text-sm text-center sm:text-left" style={{ color: 'var(--rvt-fg3)' }}>
                  &copy; {new Date().getFullYear()} {SITE_CONFIG.author.name}. All rights reserved.
                </p>
              </div>
            </div>
          </InnerContainer>
        </div>
      </OuterContainer>
    </footer>
  )
}
