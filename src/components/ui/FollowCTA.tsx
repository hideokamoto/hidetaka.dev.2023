import type { ReactNode } from 'react'
import BlueskyIcon from '@/components/tailwindui/SocialIcons/Bluesky'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '@/components/tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import { SITE_CONFIG } from '@/config'

function RssIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 4.95a10.61 10.61 0 0 1 10.61 10.61h-2.83A7.78 7.78 0 0 0 4 12.22V9.39Z" />
    </svg>
  )
}

type FollowLinkProps = {
  href: string
  label: string
  icon: ({ className }: { className?: string }) => ReactNode
}

function FollowLink({ href, label, icon: Icon }: FollowLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
    >
      <Icon className="h-5 w-5 flex-none fill-slate-500 transition group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
      <span>{label}</span>
    </a>
  )
}

type FollowCTAProps = {
  lang: string
  className?: string
}

/**
 * RSS購読とSNSフォローへの導線。
 * バイラル流入を継続的なつながりに変換するための「受け皿」。
 */
export default function FollowCTA({ lang, className = '' }: FollowCTAProps) {
  const isJa = lang.startsWith('ja')
  const rssHref = SITE_CONFIG.rss.path

  const title = isJa ? '最新の発信を受け取る' : 'Stay in the loop'
  const description = isJa
    ? 'Stripe・AWS・WordPress、開発者コミュニティの一次情報を発信しています。RSSやSNSでフォローしてください。'
    : 'First-hand notes on Stripe, AWS Serverless, WordPress, and developer communities. Follow along via RSS or social.'

  return (
    <section className={`relative ${className}`}>
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 p-10 text-center shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-indigo-950/30 dark:to-purple-950/20 sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <FollowLink
            href={rssHref}
            label={isJa ? 'RSSで購読' : 'Subscribe via RSS'}
            icon={RssIcon}
          />
          <FollowLink
            href={SITE_CONFIG.social.twitter.url}
            label="X (Twitter)"
            icon={TwitterIcon}
          />
          <FollowLink href={SITE_CONFIG.social.bluesky.url} label="Bluesky" icon={BlueskyIcon} />
          <FollowLink href={SITE_CONFIG.social.github.url} label="GitHub" icon={GitHubIcon} />
          <FollowLink href={SITE_CONFIG.social.linkedin.url} label="LinkedIn" icon={LinkedInIcon} />
        </div>
      </div>
    </section>
  )
}
