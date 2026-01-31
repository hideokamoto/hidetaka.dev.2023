import Link from 'next/link'
import CategoryTagList, { type Category } from '@/components/ui/CategoryTagList'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPThought } from '@/libs/dataSources/types'

interface BlogDetailSidebarProps {
  lang: string
  basePath: string
  categories: Category[]
  previousThought?: WPThought | null
  nextThought?: WPThought | null
  className?: string
}

export default function BlogDetailSidebar({
  lang,
  basePath,
  categories,
  previousThought,
  nextThought,
  className = '',
}: BlogDetailSidebarProps) {
  const tagsLabel = lang === 'ja' ? 'タグ' : 'Tags'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous Article'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next Article'
  const backLabel = lang === 'ja' ? 'ブログに戻る' : 'Back to Blog'

  return (
    <div className={`hidden lg:block space-y-8 ${className}`}>
      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" />

      {/* タグセクション */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{tagsLabel}</h3>
          <CategoryTagList categories={categories} basePath={basePath} />
        </div>
      )}

      {/* 前後の記事ナビゲーション */}
      {(previousThought || nextThought) && (
        <nav className="space-y-4">
          {/* 次の記事 */}
          {nextThought && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {nextLabel}
              </h3>
              <Link
                href={`${basePath}/${nextThought.slug}`}
                className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors line-clamp-2"
              >
                {nextThought.title.rendered}
              </Link>
            </div>
          )}

          {/* 前の記事 */}
          {previousThought && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {previousLabel}
              </h3>
              <Link
                href={`${basePath}/${previousThought.slug}`}
                className="block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors line-clamp-2"
              >
                {previousThought.title.rendered}
              </Link>
            </div>
          )}
        </nav>
      )}

      {/* ブログに戻るリンク */}
      <Link
        href={basePath}
        className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {backLabel}
      </Link>
    </div>
  )
}
