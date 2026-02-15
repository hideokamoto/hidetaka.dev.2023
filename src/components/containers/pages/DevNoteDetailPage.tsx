import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import CategoryTagList from '@/components/ui/CategoryTagList'
import DateDisplay from '@/components/ui/DateDisplay'
import DevNoteDetailSidebar from '@/components/ui/DevNoteDetailSidebar'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import BlogReactions from '@/components/ui/reactions/BlogReactions'
import SidebarLayout from '@/components/ui/SidebarLayout'
import SocialShareButtons from '@/components/ui/SocialShareButtons'
import { SITE_CONFIG } from '@/config'
import type { BlogItem, WPThought } from '@/libs/dataSources/types'
import { DETAIL_PAGE_SECTION_CLASS } from '@/libs/utils/detailPageStyles'

type DevNoteDetailPageProps = {
  note: WPThought
  basePath: string
  lang: 'ja' | 'en'
  previousNote?: WPThought | null
  nextNote?: WPThought | null
  relatedArticles?: BlogItem[]
  enableHatenaStar: boolean
}

export default function DevNoteDetailPage({
  note,
  basePath,
  lang,
  previousNote,
  nextNote,
  relatedArticles = [],
  enableHatenaStar,
}: DevNoteDetailPageProps) {
  const date = new Date(note.date)
  const writingLabel = lang === 'ja' ? '技術記事' : 'Writing'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous Article'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next Article'

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/dev-notes/${note.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

  // カテゴリ（タグ）を取得
  const categories =
    note._embedded?.['wp:term']?.flat().filter((term) => term.taxonomy === 'category') || []

  return (
    <Container className="mt-16 sm:mt-32">
      {/* パンくずリスト */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <div className="flex items-center text-sm">
              <Link
                href={lang === 'ja' ? '/ja/writing' : '/writing'}
                aria-label={lang === 'ja' ? `${writingLabel}に戻る` : `Go to ${writingLabel}`}
                className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                {writingLabel}
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

      {/* サイドバーレイアウト（デスクトップのみ） */}
      <SidebarLayout
        sidebar={
          <DevNoteDetailSidebar
            lang={lang}
            basePath={basePath}
            categories={categories}
            previousNote={previousNote}
            nextNote={nextNote}
          />
        }
        sidebarWidth="narrow"
        gap="lg"
      >
        <article>
          {/* 日付（タイトルの上に移動） */}
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="mb-4 text-sm lg:text-base font-medium text-slate-600 dark:text-slate-400"
          />

          {/* タイトル */}
          <header className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              {note.title.rendered}
            </h1>
          </header>

          {/* カテゴリ（モバイルのみ表示） */}
          {categories.length > 0 && (
            <CategoryTagList
              categories={categories}
              basePath={basePath}
              className="mb-8 lg:hidden"
            />
          )}

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

          {/* 記事アクション（Markdown / 要約 / 翻訳） */}
          <ArticleActions
            lang={lang}
            slug={note.slug}
            basePath={basePath}
            title={note.title.rendered}
            contentHtml={note.content.rendered}
            showTranslation
            translationContentSelector="article"
          />

          {/* コンテンツ */}
          <div
            className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
            dangerouslySetInnerHTML={{ __html: note.content.rendered }}
          />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${note.slug}`, SITE_CONFIG.url).toString()}
            title={note.title.rendered}
            lang={lang}
            className={DETAIL_PAGE_SECTION_CLASS}
          />

          {/* CTA（コールトゥアクション） */}
          <ArticleCTA lang={lang} articleType="tutorial" />

          {/* プロフィールカード（モバイルのみ表示） */}
          <div className="lg:hidden">
            <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />
          </div>

          {/* リアクション機能 */}
          <BlogReactions
            url={new URL(`${basePath}/${note.slug}`, SITE_CONFIG.url).toString()}
            title={note.title.rendered}
            slug={note.slug}
            lang={lang}
            enableHatenaStar={enableHatenaStar}
            className={DETAIL_PAGE_SECTION_CLASS}
          />

          {/* 関連記事 */}
          <RelatedArticles articles={relatedArticles} lang={lang} />

          {/* 前後の記事へのナビゲーション（モバイルのみ表示） */}
          {(previousNote || nextNote) && (
            <nav
              aria-label={lang === 'ja' ? 'Dev Notesナビゲーション' : 'Dev Notes navigation'}
              className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700 lg:hidden"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* 次の記事 */}
                {nextNote && (
                  <Link
                    href={`${basePath}/${nextNote.slug}`}
                    aria-label={`${nextLabel}: ${nextNote.title.rendered}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      ← {nextLabel}
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
                    aria-label={`${previousLabel}: ${previousNote.title.rendered}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-right"
                  >
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      {previousLabel} →
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
      </SidebarLayout>
    </Container>
  )
}
