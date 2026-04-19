'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'

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

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function toggleMode() {
    document.documentElement.classList.add('[&_*]:!transition-none')
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    })

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const isSystemDarkMode = darkModeMediaQuery.matches
    const isDarkMode = document.documentElement.classList.toggle('dark')

    if (isDarkMode === isSystemDarkMode) {
      window.localStorage.removeItem('isDarkMode')
    } else {
      window.localStorage.setItem('isDarkMode', String(isDarkMode))
    }
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleMode}
      style={{
        all: 'unset',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase' as const,
        color: 'var(--color-muted)',
        padding: '6px 10px',
        border: '1px solid var(--color-line-strong)',
        transition: 'color var(--duration-fast), border-color var(--duration-fast)',
        lineHeight: 1,
        outline: '2px solid transparent',
        outlineOffset: '2px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-ink)'
        e.currentTarget.style.borderColor = 'var(--color-ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-muted)'
        e.currentTarget.style.borderColor = 'var(--color-line-strong)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.outlineColor = 'var(--color-accent)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.outlineColor = 'transparent'
      }}
    >
      Light / Dark
    </button>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const navItems = getNavItems(lang)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 lg:hidden"
        style={{ background: 'color-mix(in oklab, var(--color-ink) 50%, transparent)' }}
        onClick={onClose}
        aria-label="Close menu"
      />
      <div
        className="fixed inset-y-0 right-0 z-50 w-80 lg:hidden"
        style={{
          background: 'var(--color-bg)',
          borderLeft: '1px solid var(--color-line-strong)',
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              Menu
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
              }}
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
            {navItems.map((item) => {
              const itemPath = getPathnameWithLangType(item.path, lang)
              const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
              return (
                <Link
                  key={item.path}
                  href={itemPath}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-widest)',
                    textTransform: 'uppercase',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-line)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                    transition: 'color var(--duration-fast)',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-line)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  marginBottom: '12px',
                }}
              >
                {lang === 'ja' ? '言語' : 'Language'}
              </div>
              <div className="flex gap-3">
                <Link
                  href={changeLanguageURL(pathname, 'ja')}
                  onClick={onClose}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wider)',
                    color: lang === 'ja' ? 'var(--color-accent)' : 'var(--color-muted)',
                  }}
                >
                  JA
                </Link>
                <Link
                  href={changeLanguageURL(pathname, 'en')}
                  onClick={onClose}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wider)',
                    color: lang === 'en' ? 'var(--color-accent)' : 'var(--color-muted)',
                  }}
                >
                  EN
                </Link>
              </div>
            </div>
          </nav>

          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-line)' }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const navItems = getNavItems(lang)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-nav)',
          background: 'var(--color-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--page-max)',
            marginInline: 'auto',
            paddingInline: 'clamp(20px, 4vw, var(--page-px))',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
          }}
        >
          {/* Logo */}
          <Link
            href={lang === 'ja' ? '/ja' : '/'}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-ink)',
              flexShrink: 0,
            }}
          >
            <strong style={{ fontWeight: 700 }}>hidetaka</strong>.dev
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              gap: 'var(--space-7)',
              marginLeft: 'auto',
            }}
          >
            {navItems.map((item) => {
              const itemPath = getPathnameWithLangType(item.path, lang)
              const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
              return (
                <Link
                  key={item.path}
                  href={itemPath}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-widest)',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                    transition: 'color var(--duration-fast)',
                    position: 'relative',
                    paddingBottom: '2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-ink)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-muted)'
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'var(--color-accent)',
                      }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Language toggle */}
            <div className="flex items-center gap-2">
              <Link
                href={changeLanguageURL(pathname, 'ja')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  color: lang === 'ja' ? 'var(--color-ink)' : 'var(--color-muted)',
                  transition: 'color var(--duration-fast)',
                }}
              >
                JA
              </Link>
              <span style={{ color: 'var(--color-line-strong)', fontSize: '10px' }}>/</span>
              <Link
                href={changeLanguageURL(pathname, 'en')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  color: lang === 'en' ? 'var(--color-ink)' : 'var(--color-muted)',
                  transition: 'color var(--duration-fast)',
                }}
              >
                EN
              </Link>
            </div>

            <ThemeToggle />
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
