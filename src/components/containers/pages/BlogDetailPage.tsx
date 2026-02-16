import Image from 'next/image'
import Link from 'next/link'
import TransformedBlogContent from '@/components/BlogPosts/TransformedBlogContent'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import BlogDetailSidebar from '@/components/ui/BlogDetailSidebar'
import CategoryTagList from '@/components/ui/CategoryTagList'
import DateDisplay from '@/components/ui/DateDisplay'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import BlogReactions from '@/components/ui/reactions/BlogReactions'
import SidebarLayout from '@/components/ui/SidebarLayout'
import SocialShareButtons from '@/components/ui/SocialShareButtons'
import { SITE_CONFIG } from '@/config'
import type { ArticleType } from '@/libs/ctaTypes'
import type { BlogItem, WPThought } from '@/libs/dataSources/types'

/**
 * カテゴリから記事タイプを決定するヘルパー関数
 *
 * @param categories - 記事のカテゴリ配列
 * @returns 適切なArticleType
 */
function getArticleTypeFromCategories(
  categories: Array<{ name: string; slug: string }>,
): ArticleType {
  const categoryNames = new Set(categories.map((c) => c.name.toLowerCase()))
  const categorySlugs = new Set(categories.map((c) => c.slug.toLowerCase()))

  // チュートリアル記事の判定
  if (categoryNames.has('tutorial') || categorySlugs.has('tutorial')) {
    return 'tutorial'
  }

  // ツール発表記事の判定
  if (
    categoryNames.has('tool') ||
    categoryNames.has('announcement') ||
    categorySlugs.has('tool') ||
    categorySlugs.has('announcement') ||
    categorySlugs.has('tool-announcement')
  ) {
    return 'tool_announcement'
  }

  // デフォルトはエッセイ
  return 'essay'
}

interface BlogDetailPageProps {
  thought: WPThought
  lang: 'ja' | 'en'
  basePath: string
  previousThought?: WPThought | null
  nextThought?: WPThought | null
  relatedArticles?: BlogItem[]
}

export default function BlogDetailPage({
  thought,
  lang,
  basePath,
  previousThought,
  nextThought,
  relatedArticles = [],
}: BlogDetailPageProps) {
  const date = new Date(thought.date)
  const blogLabel = lang === 'ja' ? 'ブログ' : 'Blog'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next'

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/thoughts/${thought.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

  // はてなスター機能の有効化判定
  // 環境変数で制御し、かつ日本語ページでのみ表示
  const enableHatenaStar = process.env.NEXT_PUBLIC_ENABLE_HATENA_STAR === 'true' && lang === 'ja'

  // カテゴリ（タグ）を取得
  const categories =
    thought._embedded?.['wp:term']?.flat().filter((term) => term.taxonomy === 'category') || []

  // カテゴリから記事タイプを決定
  const articleType = getArticleTypeFromCategories(categories)

  return (
    <Container className="mt-16 sm:mt-32">
      {/* パンくずリスト */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <div className="flex items-center text-sm">
              <Link
                href={basePath}
                className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                {blogLabel}
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
                {thought.title.rendered}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* サイドバーレイアウト（デスクトップのみ） */}
      <SidebarLayout
        sidebar={
          <BlogDetailSidebar
            lang={lang}
            basePath={basePath}
            categories={categories}
            previousThought={previousThought}
            nextThought={nextThought}
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
            className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400"
          />

          {/* タイトル */}
          <header className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              {thought.title.rendered}
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
              alt={thought.title.rendered}
              width={OG_IMAGE_WIDTH}
              height={OG_IMAGE_HEIGHT}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 記事アクション（Markdown / 要約 / 翻訳） */}
          <ArticleActions
            lang={lang}
            slug={thought.slug}
            basePath={basePath}
            title={thought.title.rendered}
            contentHtml={thought.content.rendered}
            showTranslation
            translationContentSelector="article"
          />

          {/* コンテンツ */}
          <TransformedBlogContent
            thought={thought}
            className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
          />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${thought.slug}`, SITE_CONFIG.url).toString()}
            title={thought.title.rendered}
            lang={lang}
            className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700"
          />

          {/* CTA（行動喚起） */}
          <ArticleCTA lang={lang} articleType={articleType} className="mt-12" />

          {/* プロフィールカード（モバイルのみ表示） */}
          <div className="lg:hidden">
            <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />
          </div>

          {/* リアクション機能 */}
          <BlogReactions
            url={new URL(`${basePath}/${thought.slug}`, SITE_CONFIG.url).toString()}
            title={thought.title.rendered}
            slug={thought.slug}
            lang={lang}
            enableHatenaStar={enableHatenaStar}
            className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700"
          />

          {/* 関連記事 */}
          <RelatedArticles articles={relatedArticles} lang={lang} />

          {/* 前後の記事へのナビゲーション（モバイルのみ表示） */}
          {(previousThought || nextThought) && (
            <nav
              aria-label="記事ナビゲーション"
              className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700 lg:hidden"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* 次の記事 */}
                {nextThought && (
                  <Link
                    href={`${basePath}/${nextThought.slug}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      ← {nextLabel}
                    </span>
                    <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {nextThought.title.rendered}
                    </span>
                  </Link>
                )}

                {/* 前の記事 */}
                {previousThought && (
                  <Link
                    href={`${basePath}/${previousThought.slug}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-right"
                  >
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      {previousLabel} →
                    </span>
                    <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {previousThought.title.rendered}
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
