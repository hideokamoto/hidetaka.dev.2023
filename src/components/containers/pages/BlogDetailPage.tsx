import Image from 'next/image'
import Link from 'next/link'
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
      <nav
        aria-label="Breadcrumb"
        className="mb-8"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.1em',
          color: 'var(--color-muted)',
        }}
      >
        <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <li>
            <Link href={basePath} style={{ color: 'var(--color-muted)' }}>
              {blogLabel}
            </Link>
          </li>
          <li style={{ opacity: 0.4 }}>/</li>
          <li
            style={{
              color: 'var(--color-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '40ch',
            }}
          >
            {thought.title.rendered}
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
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: 'clamp(28px,4vw,48px)',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: 'var(--color-ink)',
              }}
            >
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
          <div
            className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
            dangerouslySetInnerHTML={{ __html: thought.content.rendered }}
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
              className="ds-pagination lg:hidden"
              style={{ marginTop: '4rem' }}
            >
              <div>
                {nextThought && (
                  <Link
                    href={`${basePath}/${nextThought.slug}`}
                    className="ds-btn ds-btn--ghost ds-btn--sm"
                  >
                    ← {nextLabel}
                  </Link>
                )}
              </div>
              <div>
                {previousThought && (
                  <Link
                    href={`${basePath}/${previousThought.slug}`}
                    className="ds-btn ds-btn--ghost ds-btn--sm"
                  >
                    {previousLabel} →
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
