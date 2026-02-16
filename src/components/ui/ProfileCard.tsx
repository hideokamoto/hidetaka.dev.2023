import type { ReactNode } from 'react'
import { SITE_CONFIG } from '@/config'
import Profile from '../content/Profile'
import GitHubIcon from '../tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '../tailwindui/SocialIcons/LinkedIn'
import TwitterIcon from '../tailwindui/SocialIcons/Twitter'
import ProfileImage from './ProfileImage'

/**
 * プロフィールカードのプロパティ型定義
 */
type ProfileCardProps = {
  /** 言語設定 (英語: 'en', 日本語: 'ja') */
  lang: 'ja' | 'en'
  /** プロフィール画像を表示するかどうか */
  showImage?: boolean
  /** ソーシャルリンクを表示するかどうか */
  showSocial?: boolean
  /** 追加のCSSクラス */
  className?: string
  /** プロフィール画像のURL (デフォルト: /me.jpg) */
  imageSrc?: string
  /** プロフィール画像のサイズ (sm: 小, md: 中, lg: 大) */
  imageSize?: 'sm' | 'md' | 'lg' | 'responsive'
}

/**
 * ソーシャルリンク情報の定義（config.tsから取得）
 */
const SOCIAL_LINKS = [
  {
    href: SITE_CONFIG.social.twitter.url,
    icon: TwitterIcon,
    label: SITE_CONFIG.social.twitter.label,
    ariaLabel: SITE_CONFIG.social.twitter.ariaLabel,
  },
  {
    href: SITE_CONFIG.social.github.url,
    icon: GitHubIcon,
    label: SITE_CONFIG.social.github.label,
    ariaLabel: SITE_CONFIG.social.github.ariaLabel,
  },
  {
    href: SITE_CONFIG.social.linkedin.url,
    icon: LinkedInIcon,
    label: SITE_CONFIG.social.linkedin.label,
    ariaLabel: SITE_CONFIG.social.linkedin.ariaLabel,
  },
] as const

/**
 * ソーシャルリンクコンポーネント
 */
function SocialLink({
  href,
  icon: Icon,
  label,
  ariaLabel,
}: {
  href: string
  icon: ({ className }: { className?: string }) => ReactNode
  label: string
  ariaLabel: string
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      <Icon className="h-5 w-5 flex-none fill-slate-500 transition-colors group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </a>
  )
}

/**
 * プロフィールカードコンポーネント
 *
 * ブログ記事やその他のページで再利用可能なプロフィール表示コンポーネント。
 * プロフィール画像、名前、説明文、ソーシャルリンクを含む。
 *
 * @example
 * ```tsx
 * // フル表示
 * <ProfileCard lang="ja" />
 *
 * // コンパクト表示（画像なし、ソーシャルリンクのみ）
 * <ProfileCard lang="en" variant="compact" showImage={false} />
 *
 * // 説明文とソーシャルリンクのみ
 * <ProfileCard lang="ja" showImage={false} />
 * ```
 */
export default function ProfileCard({
  lang,
  showImage = true,
  showSocial = true,
  className = '',
  imageSrc = '/me.jpg',
  imageSize = 'md',
}: ProfileCardProps) {
  const authorName = SITE_CONFIG.author.name

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 ${className}`}
    >
      <div className={`flex flex-col gap-6`}>
        {/* プロフィール画像 */}
        {showImage && (
          <div>
            <ProfileImage src={imageSrc} alt={`${authorName} profile photo`} size={imageSize} />
          </div>
        )}

        {/* プロフィール情報 */}
        <div className="flex-1 space-y-4">
          {/* 名前 */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{authorName}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Developer Experience Engineer
            </p>
          </div>

          {/* 説明文 */}
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <Profile lang={lang} />
          </div>

          {/* ソーシャルリンク */}
          {showSocial && (
            <div className="flex flex-wrap gap-4 pt-2">
              {SOCIAL_LINKS.map((link) => (
                <SocialLink key={link.href} {...link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
