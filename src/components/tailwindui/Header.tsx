'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Container from './Container'
import ModeToggle from './Headers/ModeToggle'

function getLanguageFromURL(pathname: string) {
  if (pathname.startsWith('/ja/') || pathname === '/ja') {
    return 'ja'
  }
  return 'en'
}

function getPathnameWithLangType(targetPath: string, lang: string): string {
  if (lang === 'en' || !lang || lang === '') return `/${targetPath}`
  if (lang === 'ja') return `/ja/${targetPath}`
  return `/${lang}/${targetPath}`
}

function changeLanguageURL(pathname: string, targetLang: 'en' | 'ja' = 'en'): string {
  const lang = getLanguageFromURL(pathname)
  if (lang === targetLang) return pathname
  
  if (targetLang === 'en') {
    return pathname.replace(/^\/ja/, '') || '/'
  } else {
    return `/ja${pathname}`
  }
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="relative block px-3 py-2 transition hover:text-teal-500 dark:hover:text-teal-400"
      >
        {children}
      </Link>
    </li>
  )
}

function DesktopNavigation({ className }: { className?: string }) {
  const pathname = usePathname()
  const lang = getLanguageFromURL(pathname)

  return (
    <nav className={className}>
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
        <NavItem href={getPathnameWithLangType("about", lang)}>About</NavItem>
        <NavItem href={getPathnameWithLangType("news", lang)}>News</NavItem>
        <NavItem href={getPathnameWithLangType("articles", lang)}>Articles</NavItem>
        <NavItem href={getPathnameWithLangType("projects", lang)}>Projects</NavItem>
        <NavItem href={getPathnameWithLangType("oss", lang)}>OSS</NavItem>
        <NavItem href={getPathnameWithLangType("speaking", lang)}>Speaking</NavItem>
      </ul>
    </nav>
  )
}

function DesktopLangSwitcher() {
  const pathname = usePathname()

  return (
    <nav className="pointer-events-auto hidden md:block">
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-200 dark:ring-white/10">
        <NavItem href={changeLanguageURL(pathname, 'ja')}>Japanese</NavItem>
        <NavItem href={changeLanguageURL(pathname, 'en')}>English</NavItem>
      </ul>
    </nav>
  )
}

export default function Header() {
  return (
    <header
      className="pointer-events-none relative z-50 flex flex-col"
      style={{
        height: 'var(--header-height)',
        marginBottom: 'var(--header-mb)',
      }}
    >
      <div
        className="top-0 z-10 h-16 pt-6"
        style={{ position: 'var(--header-position)' as any }}
      >
        <Container className="top-[var(--header-top,theme(spacing.6))] w-full" style={{ position: 'var(--header-inner-position)' as any }}>
          <div className="relative flex gap-4">
            <div className="flex flex-1">
              <Link href="/" className="relative block px-3 py-2 transition pointer-events-auto">
                <span className="sr-only">Hidetaka.dev</span>
                <h1 className="text-xl dark:text-zinc-200 text-zinc-800 font-extrabold sm:text-2xl xl:text-4xl">Hidetaka.dev</h1>
              </Link>
            </div>
            <div className="flex flex-1 justify-end md:justify-center">
              <DesktopNavigation className="pointer-events-auto hidden md:block" />
            </div>
            <div className="flex flex-1 justify-end md:justify-center">
              <DesktopLangSwitcher />
            </div>
            <div className="flex justify-end md:flex-1">
              <div className="pointer-events-auto">
                <ModeToggle />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}

