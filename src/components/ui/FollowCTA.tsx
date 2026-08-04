import type { ReactNode } from 'react'
import GitHubIcon from '@/components/tailwindui/SocialIcons/GitHub'
import TwitterIcon from '@/components/tailwindui/SocialIcons/Twitter'
import { SITE_CONFIG } from '@/config'
import { getActionButtonStyles } from '@/libs/componentStyles.utils'

type FollowCTAVariant = 'section' | 'card'

type FollowCTAProps = {
  /** 表示言語 */
  lang: string
  /** X (Twitter) のフォローURL。未指定時はSITE_CONFIGの値を使用 */
  twitterUrl?: string
  /** GitHubのフォローURL。未指定時はSITE_CONFIGの値を使用 */
  githubUrl?: string
  /**
   * 表示スタイル
   * - 'section': TOPページ向け。上部に区切り線を持つ独立したセクションとして表示
   * - 'card': 記事詳細ページ向け。本文中に差し込むカード表示
   */
  variant?: FollowCTAVariant
  /** 追加のCSSクラス */
  className?: string
}

function FollowButton({
  href,
  icon,
  label,
  variant,
}: {
  href: string
  icon: ReactNode
  label: string
  variant: 'primary' | 'secondary'
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={getActionButtonStyles(variant)}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

type FollowCTACardProps = {
  lang: string
  twitterUrl: string
  githubUrl: string
  className?: string
}

function FollowCTACard({ lang, twitterUrl, githubUrl, className = '' }: FollowCTACardProps) {
  const isJapanese = lang.startsWith('ja')

  const heading = isJapanese ? '更新を見逃さないために' : 'Never miss an update'
  const description = isJapanese
    ? 'この記事が気に入ったら、X (Twitter) やGitHubをフォローして次回の更新をチェックしてください。'
    : 'If you enjoyed this article, follow on X (Twitter) or GitHub to catch the next update.'
  const twitterLabel = isJapanese ? 'Xでフォロー' : 'Follow on X'
  const githubLabel = isJapanese ? 'GitHubでフォロー' : 'Follow on GitHub'

  return (
    <section
      className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 lg:p-10 ${className}`}
      style={{ background: 'var(--rvt-bg2)', borderColor: 'var(--rvt-border)' }}
      aria-label={isJapanese ? '更新の通知を受け取るセクション' : 'Follow for updates'}
    >
      <h2
        className="mb-3 text-xl font-bold leading-tight sm:mb-4 sm:text-2xl md:text-3xl"
        style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
      >
        {heading}
      </h2>
      <p
        className="mb-5 text-sm leading-relaxed sm:mb-6 sm:text-base md:text-lg"
        style={{ color: 'var(--rvt-fg2)' }}
      >
        {description}
      </p>
      <nav
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
        aria-label={isJapanese ? 'フォロー導線' : 'Follow links'}
      >
        <FollowButton
          href={twitterUrl}
          icon={<TwitterIcon className="h-4 w-4 flex-none fill-current" />}
          label={twitterLabel}
          variant="primary"
        />
        <FollowButton
          href={githubUrl}
          icon={<GitHubIcon className="h-4 w-4 flex-none fill-current" />}
          label={githubLabel}
          variant="secondary"
        />
      </nav>
    </section>
  )
}

/**
 * FollowCTA コンポーネント
 *
 * 読者にX (Twitter) / GitHubのフォローを促すコールトゥアクション。
 * TOPページの独立セクション（`variant="section"`）と、記事詳細ページ本文内の
 * カード表示（`variant="card"`、デフォルト）の両方で利用できる。
 *
 * 純粋なUIコンポーネントとしてpropsのみに依存する。SITE_CONFIGはビルド時に
 * 固定されるサイト設定であり、副作用（データ取得など）を持たない。
 */
export default function FollowCTA({
  lang,
  twitterUrl = SITE_CONFIG.social.twitter.url,
  githubUrl = SITE_CONFIG.social.github.url,
  variant = 'card',
  className = '',
}: FollowCTAProps) {
  if (variant === 'card') {
    return (
      <FollowCTACard
        lang={lang}
        twitterUrl={twitterUrl}
        githubUrl={githubUrl}
        className={`my-8 sm:my-10 md:my-12 ${className}`}
      />
    )
  }

  const isJapanese = lang.startsWith('ja')
  const eyebrowLabel = isJapanese ? '更新をチェック' : 'STAY UPDATED'

  return (
    <section
      style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--rvt-border)' }}
      className={`py-24 sm:py-32 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <p
          className="mb-5 text-[11px] uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-accent)' }}
        >
          {eyebrowLabel}
        </p>
        <FollowCTACard lang={lang} twitterUrl={twitterUrl} githubUrl={githubUrl} />
      </div>
    </section>
  )
}
