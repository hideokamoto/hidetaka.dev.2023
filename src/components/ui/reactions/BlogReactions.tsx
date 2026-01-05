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
      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {lang === 'ja' ? '⭐ この記事への反応' : '⭐ Reactions'}
        </h2>
      </div>

      {/* はてなスター */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <HatenaStar url={url} title={title} />
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
          {lang === 'ja'
            ? 'はてなアカウントでスターを付けることができます'
            : 'You can add stars with your Hatena account'}
        </p>
      </div>
    </div>
  )
}
