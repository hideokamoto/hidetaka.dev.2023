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
      className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-900/10" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-purple-200/15 blur-3xl dark:bg-purple-900/10" />
      </div>

      <OuterContainer>
        <div className="relative border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-20">
          <InnerContainer>
            <div className="flex flex-col gap-12">
              {/* Top section: Navigation and Social Links */}
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                {/* Navigation */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
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

                {/* Language Switcher */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
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

                {/* Social Links */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Connect
                  </h3>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <a
                        href={SITE_CONFIG.social.twitter.url}
                        aria-label={SITE_CONFIG.social.twitter.ariaLabel}
                        className="group flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <TwitterIcon className="h-5 w-5 flex-none fill-slate-500 transition-colors group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
                        <span>{SITE_CONFIG.social.twitter.label}</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={SITE_CONFIG.social.github.url}
                        aria-label={SITE_CONFIG.social.github.ariaLabel}
                        className="group flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <GitHubIcon className="h-5 w-5 flex-none fill-slate-500 transition-colors group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
                        <span>{SITE_CONFIG.social.github.label}</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={SITE_CONFIG.social.linkedin.url}
                        aria-label={SITE_CONFIG.social.linkedin.ariaLabel}
                        className="group flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <LinkedInIcon className="h-5 w-5 flex-none fill-slate-500 transition-colors group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
                        <span>{SITE_CONFIG.social.linkedin.label}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom section: Copyright */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
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
