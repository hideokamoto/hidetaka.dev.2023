'use client'

import HatenaStar from './HatenaStar'

type BlogReactionsProps = {
  url: string
  title: string
  slug: string
  lang?: string
  className?: string
  enableHatenaStar?: boolean
}

/**
 * ブログリアクションコンポーネント
 *
 * 環境変数で制御可能なはてなスター機能を提供します。
 * 日本語ページでのみ表示されます。
 */
export default function BlogReactions({
  url,
  title,
  lang = 'ja',
  className = '',
  enableHatenaStar = true,
}: BlogReactionsProps) {
  // はてなスターが無効の場合は何も表示しない
  if (!enableHatenaStar) {
    return null
  }

  return (
    <div className={`blog-reactions ${className}`}>
      {/* セクションヘッダー */}
      <div className="border-b mb-6" style={{ borderColor: 'var(--rvt-border)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
          {lang === 'ja' ? '⭐ この記事への反応' : '⭐ Reactions'}
        </h2>
      </div>

      {/* はてなスター */}
      <div className="p-4 rounded-lg" style={{ background: 'var(--rvt-bg3)' }}>
        <HatenaStar url={url} title={title} />
        <p className="text-xs mt-3" style={{ color: 'var(--rvt-fg2)' }}>
          {lang === 'ja'
            ? 'はてなアカウントでスターを付けることができます'
            : 'You can add stars with your Hatena account'}
        </p>
      </div>
    </div>
  )
}
