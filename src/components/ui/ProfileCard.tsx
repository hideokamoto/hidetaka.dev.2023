import ProfileImage from './ProfileImage'
import Profile from '../content/Profile'
import TwitterIcon from '../tailwindui/SocialIcons/Twitter'
import GitHubIcon from '../tailwindui/SocialIcons/GitHub'
import LinkedInIcon from '../tailwindui/SocialIcons/LinkedIn'
import { SITE_CONFIG } from '@/config'

/**
 * プロフィールカードのプロパティ型定義
 */
type ProfileCardProps = {
  /** 言語設定 (英語: 'en', 日本語: 'ja') */
  lang: string
  /** 表示バリアント (compact: コンパクト, full: フル表示) */
  variant?: 'compact' | 'full'
  /** プロフィール画像を表示するかどうか */
  showImage?: boolean
  /** ソーシャルリンクを表示するかどうか */
  showSocial?: boolean
  /** 追加のCSSクラス */
  className?: string
  /** プロフィール画像のURL (デフォルト: /me.jpg) */
  imageSrc?: string
}

/**
 * ソーシャルリンク情報の定義
 */
const SOCIAL_LINKS = [
  {
    href: 'https://twitter.com/hidetaka_dev',
    icon: TwitterIcon,
    label: 'Twitter',
    ariaLabel: 'Follow on Twitter',
  },
  {
    href: 'https://github.com/hideokamoto',
    icon: GitHubIcon,
    label: 'GitHub',
    ariaLabel: 'Follow on GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/hideokamoto/',
    icon: LinkedInIcon,
    label: 'LinkedIn',
    ariaLabel: 'Follow on LinkedIn',
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
  icon: ({ className }: { className?: string }) => JSX.Element
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
  variant = 'full',
  showImage = true,
  showSocial = true,
  className = '',
  imageSrc = '/me.jpg',
}: ProfileCardProps) {
  const isCompact = variant === 'compact'
  const authorName = SITE_CONFIG.author.name

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 ${className}`}
    >
      <div className={`flex ${isCompact ? 'flex-row items-center gap-4' : 'flex-col gap-6'}`}>
        {/* プロフィール画像 */}
        {showImage && (
          <div className={isCompact ? 'flex-shrink-0' : ''}>
            <ProfileImage
              src={imageSrc}
              alt={`${authorName} profile photo`}
              size={isCompact ? 'sm' : 'md'}
              className={isCompact ? 'lg:w-24 max-w-[6rem]' : ''}
            />
          </div>
        )}

        {/* プロフィール情報 */}
        <div className="flex-1 space-y-4">
          {/* 名前 */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {authorName}
            </h3>
            {!isCompact && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {lang.startsWith('ja') ? 'ビジネスデベロップメント' : 'Business Development'}
              </p>
            )}
          </div>

          {/* 説明文 */}
          {!isCompact && (
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <Profile lang={lang} />
            </div>
          )}

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
