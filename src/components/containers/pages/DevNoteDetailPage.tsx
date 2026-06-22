import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import ArticleMeta from '@/components/ui/ArticleMeta'
import CategoryTagList from '@/components/ui/CategoryTagList'
import DevNoteDetailSidebar from '@/components/ui/DevNoteDetailSidebar'
import PageShell from '@/components/ui/PageShell'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import BlogReactions from '@/components/ui/reactions/BlogReactions'
import SidebarLayout from '@/components/ui/SidebarLayout'
import SocialShareButtons from '@/components/ui/SocialShareButtons'
import { SITE_CONFIG } from '@/config'
import type { AdjacentNote } from '@/libs/dataSources/devnotes'
import type { BlogItem, WPThought } from '@/libs/dataSources/types'
import { DETAIL_PAGE_SECTION_CLASS } from '@/libs/utils/detailPageStyles'

type DevNoteDetailPageProps = {
  note: WPThought
  basePath: string
  lang: 'ja' | 'en'
  previousNote?: AdjacentNote | null
  nextNote?: AdjacentNote | null
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
  const writingLabel = lang === 'ja' ? '技術記事' : 'Writing'
  const homeLabel = lang === 'ja' ? 'ホーム' : 'Home'
  const writingHref = lang === 'ja' ? '/ja/writing' : '/writing'
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
      {/* ヘッダー（パンくず + タイトル） */}
      <PageShell
        breadcrumb={[
          { label: homeLabel, href: lang === 'ja' ? '/ja' : '/' },
          { label: writingLabel, href: writingHref },
          { label: note.title.rendered },
        ]}
        title={note.title.rendered}
      />

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
          {/* 公開日 / 更新日 */}
          <ArticleMeta published={note.date} updated={note.modified} lang={lang} />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${note.slug}`, SITE_CONFIG.url).toString()}
            title={note.title.rendered}
            lang={lang}
            className="mb-8"
          />

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
            className="blog-content leading-relaxed"
            style={{ color: 'var(--rvt-fg2)' }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
            dangerouslySetInnerHTML={{ __html: note.content.rendered }}
          />

          {/* CTA（コールトゥアクション） */}
          <ArticleCTA lang={lang} articleType="dev_note" />

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
              className="mt-16 pt-8 border-t lg:hidden"
              style={{ borderColor: 'var(--rvt-border)' }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* 次の記事 */}
                {nextNote && (
                  <Link
                    href={`${basePath}/${nextNote.slug}`}
                    aria-label={`${nextLabel}: ${nextNote.title.rendered}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg transition-colors"
                    style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                  >
                    <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                      ← {nextLabel}
                    </span>
                    <span
                      className="text-base font-semibold group-hover:text-indigo-600 transition-colors line-clamp-2"
                      style={{ color: 'var(--rvt-fg)' }}
                    >
                      {nextNote.title.rendered}
                    </span>
                  </Link>
                )}

                {/* 前の記事 */}
                {previousNote && (
                  <Link
                    href={`${basePath}/${previousNote.slug}`}
                    aria-label={`${previousLabel}: ${previousNote.title.rendered}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg transition-colors text-right"
                    style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                  >
                    <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                      {previousLabel} →
                    </span>
                    <span
                      className="text-base font-semibold group-hover:text-indigo-600 transition-colors line-clamp-2"
                      style={{ color: 'var(--rvt-fg)' }}
                    >
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
