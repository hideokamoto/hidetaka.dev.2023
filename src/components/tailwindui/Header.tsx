'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'
import Container from './Container'
import ModeToggle from './Headers/ModeToggle'

/**
 * Render a menu icon that switches between hamburger and close states.
 *
 * @param isOpen - When `true`, displays the close ("X") icon; when `false`, displays the hamburger menu icon.
 * @returns The SVG element representing the current menu icon state.
 */
function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      {isOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      )}
    </svg>
  )
}

function MobileNavItem({
  href,
  children,
  isActive,
  onClick,
}: {
  href: string
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
        isActive
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
          : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5'
      }`}
    >
      {children}
    </Link>
  )
}

function DesktopNavItem({
  href,
  children,
  isActive,
}: {
  href: string
  children: React.ReactNode
  isActive?: boolean
}) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
          : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
      )}
    </Link>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const currentLang = lang

  const navItems = [
    { path: 'about', label: lang === 'ja' ? '概要' : 'About' },
    { path: 'work', label: lang === 'ja' ? '制作物' : 'Work' },
    { path: 'writing', label: lang === 'ja' ? '執筆' : 'Writing' },
    { path: 'blog', label: lang === 'ja' ? 'ブログ' : 'Blog' },
    { path: 'news', label: lang === 'ja' ? 'ニュース' : 'News' },
    { path: 'speaking', label: lang === 'ja' ? '登壇' : 'Speaking' },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-zinc-900/5 dark:bg-zinc-900/95 dark:ring-white/10 lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close menu"
            >
              <MenuIcon isOpen={true} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-2">
              {navItems.map((item) => {
                const itemPath = getPathnameWithLangType(item.path, lang)
                const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
                return (
                  <MobileNavItem
                    key={item.path}
                    href={itemPath}
                    isActive={isActive}
                    onClick={onClose}
                  >
                    {item.label}
                  </MobileNavItem>
                )
              })}
            </div>

            {/* Language Switcher */}
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="px-4 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Language
              </h3>
              <div className="space-y-2">
                <MobileNavItem
                  href={changeLanguageURL(pathname, 'ja')}
                  isActive={currentLang === 'ja'}
                  onClick={onClose}
                >
                  日本語
                </MobileNavItem>
                <MobileNavItem
                  href={changeLanguageURL(pathname, 'en')}
                  isActive={currentLang === 'en'}
                  onClick={onClose}
                >
                  English
                </MobileNavItem>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function DesktopNavigation() {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)

  const navItems = [
    { path: 'about', label: lang === 'ja' ? '概要' : 'About' },
    { path: 'work', label: lang === 'ja' ? '制作物' : 'Work' },
    { path: 'writing', label: lang === 'ja' ? '執筆' : 'Writing' },
    { path: 'blog', label: lang === 'ja' ? 'ブログ' : 'Blog' },
    { path: 'news', label: lang === 'ja' ? 'ニュース' : 'News' },
    { path: 'speaking', label: lang === 'ja' ? '登壇' : 'Speaking' },
  ]

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => {
        const itemPath = getPathnameWithLangType(item.path, lang)
        const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
        return (
          <DesktopNavItem key={item.path} href={itemPath} isActive={isActive}>
            {item.label}
          </DesktopNavItem>
        )
      })}
    </nav>
  )
}

function DesktopLangSwitcher() {
  const pathname = usePathname()
  const currentLang = getLanguageFromURL(pathname)

  return (
    <div className="hidden lg:flex items-center gap-1 rounded-lg bg-white/80 backdrop-blur-md px-2 py-1.5 shadow-sm ring-1 ring-zinc-900/5 dark:bg-zinc-800/80 dark:ring-white/10">
      <Link
        href={changeLanguageURL(pathname, 'ja')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currentLang === 'ja'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
            : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        JA
      </Link>
      <Link
        href={changeLanguageURL(pathname, 'en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currentLang === 'en'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
            : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        EN
      </Link>
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header
        className="relative z-50 bg-white dark:bg-zinc-900"
        style={{
          height: 'var(--header-height)',
          marginBottom: 'var(--header-mb)',
        }}
      >
        {/* Background decoration - subtle and minimal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-900/10" />
          <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-purple-200/15 blur-3xl dark:bg-purple-900/10" />
        </div>

        <div
          className="relative top-0 z-10 h-20 pt-6"
          style={{ position: 'var(--header-position)' } as unknown as React.CSSProperties}
        >
          <Container
            className="top-[var(--header-top,theme(spacing.6))] w-full"
            style={{ position: 'var(--header-inner-position)' } as unknown as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="group relative flex-shrink-0">
                <span className="sr-only">Hidetaka.dev</span>
                <div className="relative">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Hidetaka.dev
                  </h1>
                  <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full dark:bg-indigo-400" />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <DesktopNavigation />
              </div>

              {/* Right side: Language Switcher & Dark Mode Toggle */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <DesktopLangSwitcher />

                <div className="hidden lg:block">
                  <ModeToggle />
                </div>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <MenuIcon isOpen={mobileMenuOpen} />
                </button>
              </div>
            </div>
          </Container>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
