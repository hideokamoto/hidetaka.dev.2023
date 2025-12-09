import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import { InArticleAd } from '@/components/ui/GoogleAds'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import Tag from '@/components/ui/Tag'
import type { BlogItem, WPThought } from '@/libs/dataSources/types'

type DevNoteDetailPageProps = {
  note: WPThought
  basePath: string
  previousNote?: WPThought | null
  nextNote?: WPThought | null
  relatedArticles?: BlogItem[]
}

export default function DevNoteDetailPage({
  note,
  basePath,
  previousNote,
  nextNote,
  relatedArticles = [],
}: DevNoteDetailPageProps) {
  const date = new Date(note.date)

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/dev-notes/${note.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href="/ja/writing"
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Writing
                </Link>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-2 size-5 shrink-0 text-slate-300 dark:text-slate-600"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                  {note.title.rendered}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* サムネイル画像 (OG画像) */}
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={ogImageUrl}
            alt={note.title.rendered}
            width={OG_IMAGE_WIDTH}
            height={OG_IMAGE_HEIGHT}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* タイトル */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {note.title.rendered}
          </h1>
        </header>

        {/* 日付とカテゴリ */}
        <div className="mb-10 flex flex-col gap-4">
          <DateDisplay
            date={date}
            lang="ja"
            format="long"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          />
          {note._embedded?.['wp:term'] && (
            <div className="flex flex-wrap gap-2">
              {note._embedded['wp:term']
                .flat()
                .filter((term) => term.taxonomy === 'category')
                .map((category) => (
                  <Tag key={category.id} variant="indigo" size="sm">
                    {category.name}
                  </Tag>
                ))}
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div
          className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
          dangerouslySetInnerHTML={{ __html: note.content.rendered }}
        />

        {/* In-Article Ad */}
        <InArticleAd />

        {/* プロフィールカード */}
        <ProfileCard lang="ja" imageSrc="/images/profile.jpg" className="mt-12" />

        {/* 関連記事 */}
        <RelatedArticles articles={relatedArticles} lang="ja" />

        {/* 前後の記事へのナビゲーション */}
        {(previousNote || nextNote) && (
          <nav
            aria-label="記事ナビゲーション"
            className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* 次の記事 */}
              {nextNote && (
                <Link
                  href={`${basePath}/${nextNote.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    ← 次の記事
                  </span>
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {nextNote.title.rendered}
                  </span>
                </Link>
              )}

              {/* 前の記事 */}
              {previousNote && (
                <Link
                  href={`${basePath}/${previousNote.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-right"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    前の記事 →
                  </span>
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {previousNote.title.rendered}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </Container>
  )
}
