import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import Tag from '@/components/ui/Tag'
import type { BlogItem } from '@/libs/dataSources/types'

type DevNotesArchivePageProps = {
  lang: string
  items: BlogItem[]
}

/**
 * Dev-notesカードコンポーネント
 * Individual dev-note card with title, date, description, and categories
 * @param item - Blog item containing dev-note data
 * @param lang - Language code ('ja' or 'en')
 * @returns Card component with hover effects and category tags
 */
function DevNoteCard({ item, lang }: { item: BlogItem; lang: string }) {
  const date = new Date(item.datetime)

  return (
    <Link href={item.href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {/* Date and Categories */}
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
              {item.categories &&
                item.categories.length > 0 &&
                item.categories.map((category) => (
                  <Tag key={category.id} variant="indigo" size="sm">
                    {category.name}
                  </Tag>
                ))}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                {item.description}
              </p>
            )}

            {/* Read more indicator */}
            <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
              {lang === 'ja' ? '続きを読む' : 'Read more'}
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

/**
 * 記事が見つからない場合のメッセージコンポーネント
 * Empty state message displayed when no dev-notes are available
 * @param lang - Language code ('ja' or 'en')
 * @returns Centered message component
 */
function NoArticlesMessage({ lang }: { lang: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-slate-600 dark:text-slate-400">
        {lang === 'ja' ? '開発メモが見つかりませんでした。' : 'No development notes found.'}
      </p>
    </div>
  )
}

/**
 * DevNotesArchivePage - Archive page for dev-notes articles
 * Displays a grid of development notes with title, description, date, and categories
 * @param lang - Language code ('ja' or 'en')
 * @param items - Array of dev-notes blog items to display
 * @returns Page section with header and grid layout of dev-notes
 */
export default function DevNotesArchivePage({ lang, items }: DevNotesArchivePageProps) {
  const title = lang === 'ja' ? '開発メモ' : 'Development Notes'
  const description =
    lang === 'ja'
      ? '日々の開発で気づいたことや学んだことを記録しています。'
      : 'A collection of notes and learnings from daily development work.'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader title={title} description={description} />

        {/* 記事グリッド */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {items.map((item) => (
              <DevNoteCard key={item.id || item.href} item={item} lang={lang} />
            ))}
          </div>
        ) : (
          <NoArticlesMessage lang={lang} />
        )}
      </Container>
    </section>
  )
}
