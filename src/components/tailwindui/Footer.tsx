'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="transition hover:text-teal-500 dark:hover:text-teal-400">
      {children}
    </Link>
  )
}

function InnerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative px-4 sm:px-8 lg:px-12 ${className}`}>
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  )
}

function OuterContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
    <footer className="mt-32">
      <OuterContainer>
        <div className="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
          <InnerContainer>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <NavLink href={getPathnameWithLangType("about", lang)}>About</NavLink>
                <NavLink href={getPathnameWithLangType("projects", lang)}>Projects</NavLink>
                <NavLink href={getPathnameWithLangType("speaking", lang)}>Speaking</NavLink>
                <NavLink href={getPathnameWithLangType("oss", lang)}>Open Source</NavLink>
              </div>
              <div className="flex gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <NavLink href={changeLanguageURL(pathname, 'ja')}>Japanese</NavLink>
                <NavLink href={changeLanguageURL(pathname, 'en')}>English</NavLink>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                &copy; {new Date().getFullYear()} Hidetaka Okamoto. All rights reserved.
              </p>
            </div>
          </InnerContainer>
        </div>
      </OuterContainer>
    </footer>
  )
}

