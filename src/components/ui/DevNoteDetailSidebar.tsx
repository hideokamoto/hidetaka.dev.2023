import Link from 'next/link'
import CategoryTagList, { type Category } from '@/components/ui/CategoryTagList'
import ProfileCard from '@/components/ui/ProfileCard'
import type { AdjacentNote } from '@/libs/dataSources/devnotes'

interface DevNoteDetailSidebarProps {
  lang: 'ja' | 'en'
  basePath: string
  categories: Category[]
  previousNote?: AdjacentNote | null
  nextNote?: AdjacentNote | null
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
    <div className={`hidden lg:block lg:space-y-8 ${className}`}>
      {/* タグセクション */}
      {categories.length > 0 && (
        <div>
          <h3 className="lg:mb-3 lg:text-sm lg:font-semibold" style={{ color: 'var(--rvt-fg)' }}>
            {tagsLabel}
          </h3>
          <CategoryTagList categories={categories} basePath={basePath} />
        </div>
      )}

      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 前後の記事ナビゲーション */}
      {(previousNote || nextNote) && (
        <nav className="lg:space-y-4">
          {/* 次の記事 */}
          {nextNote && (
            <div>
              <h3
                className="lg:mb-2 lg:text-sm lg:font-semibold"
                style={{ color: 'var(--rvt-fg)' }}
              >
                {nextLabel}
              </h3>
              <Link
                href={`${basePath}/${nextNote.slug}`}
                aria-label={`${nextLabel}: ${nextNote.title.rendered}`}
                className="block lg:p-3 lg:text-sm lg:font-medium text-indigo-600 hover:text-indigo-700 lg:rounded-lg transition-colors line-clamp-2"
                style={{ background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)' }}
              >
                {nextNote.title.rendered}
              </Link>
            </div>
          )}

          {/* 前の記事 */}
          {previousNote && (
            <div>
              <h3
                className="lg:mb-2 lg:text-sm lg:font-semibold"
                style={{ color: 'var(--rvt-fg)' }}
              >
                {previousLabel}
              </h3>
              <Link
                href={`${basePath}/${previousNote.slug}`}
                aria-label={`${previousLabel}: ${previousNote.title.rendered}`}
                className="block lg:p-3 lg:text-sm lg:font-medium text-indigo-600 hover:text-indigo-700 lg:rounded-lg transition-colors line-clamp-2"
                style={{ background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)' }}
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
        aria-label={backLabel}
        className="block lg:text-sm lg:font-medium text-[var(--rvt-fg2)] hover:text-[var(--rvt-fg)] transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  )
}
