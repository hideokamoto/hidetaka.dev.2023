import Link from 'next/link'
import CategoryTagList, { type Category } from '@/components/ui/CategoryTagList'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPThought } from '@/libs/dataSources/types'

interface DevNoteDetailSidebarProps {
  lang: string
  basePath: string
  categories: Category[]
  previousNote?: WPThought | null
  nextNote?: WPThought | null
  className?: string
}

export default function DevNoteDetailSidebar({
  lang,
  basePath,
  categories,
  previousNote,
  nextNote,
  className = '',
}: DevNoteDetailSidebarProps) {
  const tagsLabel = lang === 'ja' ? 'タグ' : 'Tags'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous Article'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next Article'
  const backLabel = lang === 'ja' ? 'Writing に戻る' : 'Back to Writing'

  return (
    <div className={`hidden lg:block space-y-8 ${className}`}>
      {/* タグセクション */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{tagsLabel}</h3>
          <CategoryTagList categories={categories} basePath={basePath} />
        </div>
      )}

      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 前後の記事ナビゲーション */}
      {(previousNote || nextNote) && (
        <nav className="space-y-4">
          {/* 次の記事 */}
          {nextNote && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {nextLabel}
              </h3>
              <Link
                href={`${basePath}/${nextNote.slug}`}
                className="block p-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors line-clamp-2"
              >
                {nextNote.title.rendered}
              </Link>
            </div>
          )}

          {/* 前の記事 */}
          {previousNote && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {previousLabel}
              </h3>
              <Link
                href={`${basePath}/${previousNote.slug}`}
                className="block p-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors line-clamp-2"
              >
                {previousNote.title.rendered}
              </Link>
            </div>
          )}
        </nav>
      )}

      {/* Writingに戻る */}
      <Link
        href={lang === 'ja' ? '/ja/writing' : '/writing'}
        className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  )
}
