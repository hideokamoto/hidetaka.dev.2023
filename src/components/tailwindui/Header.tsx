'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'
import ModeToggle from './Headers/ModeToggle'

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)

  const navItems = [
    { path: 'writing', label: lang === 'ja' ? '執筆' : 'Writing' },
    { path: 'work', label: lang === 'ja' ? '制作物' : 'Work' },
    { path: 'speaking', label: lang === 'ja' ? '登壇' : 'Speaking' },
    { path: 'about', label: lang === 'ja' ? '概要' : 'About' },
  ]

  return (
    <>
      {navItems.map((item) => {
        const href = getPathnameWithLangType(item.path, lang)
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={item.path}
            href={href}
            onClick={onClose}
            className="ds-site-nav__link"
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

export default function Header() {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="ds-site-nav">
        <div className="ds-site-nav__inner">
          {/* Logo */}
          <Link href={lang === 'ja' ? '/ja' : '/'} className="ds-site-nav__logo">
            <strong>HIDETAKA</strong>.DEV
          </Link>

          {/* Desktop links */}
          <div className="ds-site-nav__links hidden sm:flex">
            <NavLinks />
            {/* Language switcher */}
            <Link
              href={changeLanguageURL(pathname, lang === 'ja' ? 'en' : 'ja')}
              className="ds-site-nav__link"
            >
              {lang === 'ja' ? 'EN' : 'JA'}
            </Link>
            <ModeToggle />
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="sm:hidden ds-theme-btn ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '≡'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[var(--color-ink)]/20"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-[var(--color-bg)] border-l border-[var(--color-line-strong)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
              <span className="ds-site-nav__logo">
                <strong>HIDETAKA</strong>.DEV
              </span>
              <button
                type="button"
                className="ds-theme-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-0 px-6 py-6 flex-1">
              <NavLinks onClose={() => setMobileOpen(false)} />
              <Link
                href={changeLanguageURL(pathname, lang === 'ja' ? 'en' : 'ja')}
                className="ds-site-nav__link mt-4 pt-4 border-t border-[var(--color-line)]"
                onClick={() => setMobileOpen(false)}
              >
                {lang === 'ja' ? 'English' : '日本語'}
              </Link>
            </nav>
            <div className="px-6 py-4 border-t border-[var(--color-line)]">
              <ModeToggle />
            </div>
          </div>
        </>
      )}
    </>
  )
}
