import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import Tag from '@/components/ui/Tag'
import type { WPThought } from '@/libs/dataSources/types'

type BlogDetailSidebarProps = {
  lang: string
  basePath: string
  thought: WPThought
  previousThought?: WPThought | null
  nextThought?: WPThought | null
}

export default function BlogDetailSidebar({
  lang,
  basePath,
  thought,
  previousThought,
  nextThought,
}: BlogDetailSidebarProps) {
  const tagsLabel = lang === 'ja' ? 'タグ' : 'Tags'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous Article'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next Article'
  const backLabel = lang === 'ja' ? 'ブログに戻る' : 'Back to Blog'

  // カテゴリ（タグ）を取得
  const categories =
    thought._embedded?.['wp:term']?.flat().filter((term) => term.taxonomy === 'category') || []

  return (
    <div className="space-y-8">
      {/* プロフィールカード */}
      <div className="hidden lg:block">
        <ProfileCard lang={lang} imageSrc="/images/profile.jpg" />
      </div>

      {/* タグセクション */}
      {categories.length > 0 && (
        <div className="hidden lg:block">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{tagsLabel}</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const normalizedSlug = category.slug.includes('%')
                ? decodeURIComponent(category.slug)
                : category.slug
              const categoryUrl = `${basePath}/category/${encodeURIComponent(normalizedSlug)}`
              return (
                <Link key={category.id} href={categoryUrl}>
                  <Tag
                    variant="indigo"
                    size="sm"
                    className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    {category.name}
                  </Tag>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 前後の記事ナビゲーション */}
      {(previousThought || nextThought) && (
        <nav className="hidden lg:block space-y-4">
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
      <div className="hidden lg:block">
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
    </div>
  )
}
