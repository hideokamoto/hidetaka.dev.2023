'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDialogA11y } from '@/libs/hooks/useDialogA11y'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'
import Container from './Container'
import ModeToggle from './Headers/ModeToggle'

type NavItem = {
  path: string
  label: string
  jaOnly?: boolean
}

function getNavItems(lang: string): NavItem[] {
  const allNavItems: NavItem[] = [
    { path: 'about', label: lang === 'ja' ? '概要' : 'About' },
    { path: 'work', label: lang === 'ja' ? '制作物' : 'Work' },
    { path: 'writing', label: lang === 'ja' ? '執筆' : 'Writing' },
    { path: 'blog', label: lang === 'ja' ? 'ブログ' : 'Blog', jaOnly: true },
    { path: 'news', label: lang === 'ja' ? 'ニュース' : 'News' },
    { path: 'speaking', label: lang === 'ja' ? '登壇' : 'Speaking' },
  ]
  return allNavItems.filter((item) => !item.jaOnly || lang === 'ja')
}

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
      className="block px-4 py-3 text-base font-medium rounded-lg transition-all"
      style={
        isActive
          ? {
              color: 'var(--rvt-accent)',
              background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
            }
          : { color: 'var(--rvt-fg2)' }
      }
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
      className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all"
      style={
        isActive
          ? {
              color: 'var(--rvt-accent)',
              background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
            }
          : { color: 'var(--rvt-fg2)' }
      }
    >
      {children}
      {isActive && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
          style={{ background: 'var(--rvt-accent)' }}
        />
      )}
    </Link>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const currentLang = lang
  const navItems = getNavItems(lang)
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose)

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
      <button
        type="button"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-label="Close menu"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'ja' ? 'メニュー' : 'Menu'}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm backdrop-blur-md shadow-2xl lg:hidden"
        style={{
          background: 'color-mix(in oklch, var(--rvt-bg) 95%, transparent)',
          outline: '1px solid var(--rvt-border)',
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--rvt-border)' }}
          >
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
              Menu
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--rvt-fg2)' }}
              aria-label="Close menu"
            >
              <MenuIcon isOpen={true} />
            </button>
          </div>

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

            <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--rvt-border)' }}>
              <h3
                className="px-4 mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg3)' }}
              >
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

          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--rvt-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--rvt-fg2)' }}>
                Theme
              </span>
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
  const navItems = getNavItems(lang)

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
    <div
      className="hidden lg:flex items-center gap-1 px-2 py-1.5 backdrop-blur-md shadow-sm"
      style={{
        borderRadius: 'var(--rvt-radius-sm)',
        background: 'color-mix(in oklch, var(--rvt-bg2) 90%, transparent)',
        outline: '1px solid var(--rvt-border)',
      }}
    >
      {(['ja', 'en'] as const).map((l) => (
        <Link
          key={l}
          href={changeLanguageURL(pathname, l)}
          className="px-3 py-1.5 text-sm font-medium transition-all"
          style={{
            borderRadius: 'var(--rvt-radius-sm)',
            fontFamily: 'var(--rvt-font-mono)',
            ...(currentLang === l
              ? {
                  color: 'var(--rvt-accent)',
                  background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
                }
              : { color: 'var(--rvt-fg2)' }),
          }}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header
        className="relative z-50"
        style={{
          height: 'var(--header-height)',
          marginBottom: 'var(--header-mb)',
          background: 'var(--rvt-bg)',
        }}
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--rvt-accent-glow) 0%, transparent 70%)',
            }}
          />
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
              <Link href="/" className="group relative flex-shrink-0">
                <span className="sr-only">Hidetaka.dev</span>
                <div className="relative">
                  <p
                    className="text-xl sm:text-2xl font-extrabold tracking-tight transition-colors"
                    style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
                  >
                    Hidetaka.dev
                  </p>
                  <div
                    className="absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                    style={{ background: 'var(--rvt-accent)' }}
                  />
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <DesktopNavigation />
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <DesktopLangSwitcher />
                <div className="hidden lg:block">
                  <ModeToggle />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden rounded-lg p-2 transition-colors"
                  style={{ color: 'var(--rvt-fg2)' }}
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

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
