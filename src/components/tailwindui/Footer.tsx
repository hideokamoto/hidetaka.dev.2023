'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_CONFIG } from '@/config'
import {
  changeLanguageURL,
  getLanguageFromURL,
  getPathnameWithLangType,
} from '@/libs/urlUtils/lang.util'

export default function Footer() {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)
  const isJa = lang === 'ja'

  return (
    <footer className="ds-site-footer">
      <div className="ds-site-footer__inner">
        {/* Brand */}
        <div>
          <div className="ds-site-footer__brand">HIDETAKA.DEV</div>
          <div className="ds-site-footer__copy">
            Engineering partner for SaaS &amp; commerce.
            <br />
            Based in Kyoto, Japan.
          </div>
          <div className="ds-site-footer__copy" style={{ marginTop: '16px' }}>
            &copy; {new Date().getFullYear()} Hidetaka Okamoto
          </div>
        </div>

        {/* Pages nav */}
        <nav>
          <div className="ds-site-footer__nav-title">{isJa ? 'ページ' : 'Pages'}</div>
          <Link
            href={getPathnameWithLangType('writing', lang)}
            className="ds-site-footer__nav-link"
          >
            {isJa ? '執筆' : 'Writing'}
          </Link>
          <Link href={getPathnameWithLangType('work', lang)} className="ds-site-footer__nav-link">
            {isJa ? '制作物' : 'Work'}
          </Link>
          <Link
            href={getPathnameWithLangType('speaking', lang)}
            className="ds-site-footer__nav-link"
          >
            {isJa ? '登壇' : 'Speaking'}
          </Link>
          <Link href={getPathnameWithLangType('about', lang)} className="ds-site-footer__nav-link">
            {isJa ? '概要' : 'About'}
          </Link>
          <Link
            href={getPathnameWithLangType('privacy', lang)}
            className="ds-site-footer__nav-link"
          >
            {isJa ? 'プライバシー' : 'Privacy'}
          </Link>
        </nav>

        {/* Connect nav */}
        <nav>
          <div className="ds-site-footer__nav-title">{isJa ? 'リンク' : 'Connect'}</div>
          <a
            href={SITE_CONFIG.social.twitter.url}
            className="ds-site-footer__nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter / X
          </a>
          <a
            href={SITE_CONFIG.social.github.url}
            className="ds-site-footer__nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={SITE_CONFIG.social.linkedin.url}
            className="ds-site-footer__nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <Link
            href={changeLanguageURL(pathname, lang === 'ja' ? 'en' : 'ja')}
            className="ds-site-footer__nav-link"
          >
            {lang === 'ja' ? 'English' : '日本語'}
          </Link>
        </nav>

        {/* Status */}
        <div className="ds-site-footer__status">
          <div style={{ marginBottom: '12px' }}>
            <span className="ds-site-footer__status-dot" />
            <span className="ds-site-footer__status-label">{isJa ? '受付中' : 'Available'}</span>
          </div>
          <div className="ds-site-footer__copy" style={{ textAlign: 'right' }}>
            Q2 2026
            <br />2 slots remaining
          </div>
        </div>
      </div>
    </footer>
  )
}
