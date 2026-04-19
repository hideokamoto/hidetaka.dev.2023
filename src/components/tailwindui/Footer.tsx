'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/config'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-2xs)',
  letterSpacing: 'var(--tracking-widest)',
  textTransform: 'uppercase',
  color: 'var(--color-muted)',
  marginBottom: '16px',
}

const monoLink: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  letterSpacing: 'var(--tracking-wide)',
  color: 'var(--color-muted)',
  marginBottom: '12px',
  transition: 'color var(--duration-fast)',
  textDecoration: 'none',
}

export default function Footer() {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)

  const navLinks = [
    { path: 'about', label: lang === 'ja' ? '概要' : 'About' },
    { path: 'work', label: lang === 'ja' ? '制作物' : 'Work' },
    { path: 'writing', label: lang === 'ja' ? '執筆' : 'Writing' },
    { path: 'speaking', label: lang === 'ja' ? '登壇' : 'Speaking' },
    { path: 'privacy', label: lang === 'ja' ? 'プライバシー' : 'Privacy' },
  ]

  return (
    <footer
      style={{
        marginTop: 'var(--space-13)',
        borderTop: '1px solid var(--color-line-strong)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--page-max)',
          marginInline: 'auto',
          paddingInline: 'clamp(20px, 4vw, var(--page-px))',
          paddingBlock: 'var(--space-10)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-7)',
          alignItems: 'start',
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-ink)',
              marginBottom: '12px',
            }}
          >
            hidetaka.dev
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-muted)',
              letterSpacing: 'var(--tracking-wide)',
              lineHeight: 'var(--leading-loose)',
            }}
          >
            Developer Experience Engineer
            <br />© {new Date().getFullYear()} {SITE_CONFIG.author.name}
          </p>
        </div>

        {/* Pages */}
        <nav>
          <div style={monoLabel}>{lang === 'ja' ? 'ページ' : 'Pages'}</div>
          {navLinks.map((item) => (
            <Link
              key={item.path}
              href={getPathnameWithLangType(item.path, lang)}
              style={monoLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Language */}
        <div>
          <div style={monoLabel}>{lang === 'ja' ? '言語' : 'Language'}</div>
          <Link
            href={changeLanguageURL(pathname, 'ja')}
            style={monoLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-ink)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted)'
            }}
          >
            {lang === 'ja' ? '日本語' : 'Japanese'}
          </Link>
          <Link
            href={changeLanguageURL(pathname, 'en')}
            style={monoLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-ink)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted)'
            }}
          >
            {lang === 'ja' ? '英語' : 'English'}
          </Link>
        </div>

        {/* Social / Status */}
        <div style={{ textAlign: 'right' }}>
          <div style={monoLabel}>{lang === 'ja' ? 'つながる' : 'Connect'}</div>
          {[
            { href: SITE_CONFIG.social.twitter.url, label: 'X / Twitter' },
            { href: SITE_CONFIG.social.github.url, label: 'GitHub' },
            { href: SITE_CONFIG.social.linkedin.url, label: 'LinkedIn' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...monoLink, display: 'inline-block' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              {link.label}
            </a>
          ))}

          {/* Status dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '100px',
                background: 'var(--color-accent)',
                boxShadow: '0 0 0 3px color-mix(in oklab, var(--color-accent) 22%, transparent)',
                animation: 'hdk-pulse 2.4s infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              {lang === 'ja' ? '対応可能' : 'Available'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
