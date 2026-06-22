import Image from 'next/image'
import Link from 'next/link'
import TransformedBlogContent from '@/components/BlogPosts/TransformedBlogContent'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import ArticleMeta from '@/components/ui/ArticleMeta'
import BlogDetailSidebar from '@/components/ui/BlogDetailSidebar'
import CategoryTagList from '@/components/ui/CategoryTagList'
import PageShell from '@/components/ui/PageShell'
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
  const terms = new Set(categories.flatMap((c) => [c.name.toLowerCase(), c.slug.toLowerCase()]))

  // チュートリアル記事の判定
  if (terms.has('tutorial')) {
    return 'tutorial'
  }

  // ツール発表記事の判定
  if (terms.has('tool') || terms.has('announcement') || terms.has('tool-announcement')) {
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
  const blogLabel = lang === 'ja' ? 'ブログ' : 'Blog'
  const homeLabel = lang === 'ja' ? 'ホーム' : 'Home'
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
      {/* ヘッダー（パンくず + タイトル） */}
      <PageShell
        breadcrumb={[
          { label: homeLabel, href: lang === 'ja' ? '/ja' : '/' },
          { label: blogLabel, href: basePath },
          { label: thought.title.rendered },
        ]}
        title={thought.title.rendered}
      />

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
          {/* 公開日 / 更新日 */}
          <ArticleMeta published={thought.date} updated={thought.modified} lang={lang} />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${thought.slug}`, SITE_CONFIG.url).toString()}
            title={thought.title.rendered}
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
          <div style={{ color: 'var(--rvt-fg2)' }}>
            <TransformedBlogContent thought={thought} className="blog-content leading-relaxed" />
          </div>

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
            className="mt-12 pt-8 border-t [border-color:var(--rvt-border)]"
          />

          {/* 関連記事 */}
          <RelatedArticles articles={relatedArticles} lang={lang} />

          {/* 前後の記事へのナビゲーション（モバイルのみ表示） */}
          {(previousThought || nextThought) && (
            <nav
              aria-label="記事ナビゲーション"
              className="mt-16 pt-8 border-t lg:hidden"
              style={{ borderColor: 'var(--rvt-border)' }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* 次の記事 */}
                {nextThought && (
                  <Link
                    href={`${basePath}/${nextThought.slug}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--rvt-border)',
                      background: 'var(--rvt-bg2)',
                      border: '1px solid var(--rvt-border)',
                    }}
                  >
                    <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                      ← {nextLabel}
                    </span>
                    <span className="text-base font-semibold transition-colors line-clamp-2 text-[var(--rvt-fg)] group-hover:text-[var(--rvt-accent)]">
                      {nextThought.title.rendered}
                    </span>
                  </Link>
                )}

                {/* 前の記事 */}
                {previousThought && (
                  <Link
                    href={`${basePath}/${previousThought.slug}`}
                    className="group flex flex-col flex-1 p-4 rounded-lg transition-colors text-right"
                    style={{
                      borderColor: 'var(--rvt-border)',
                      background: 'var(--rvt-bg2)',
                      border: '1px solid var(--rvt-border)',
                    }}
                  >
                    <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                      {previousLabel} →
                    </span>
                    <span className="text-base font-semibold transition-colors line-clamp-2 text-[var(--rvt-fg)] group-hover:text-[var(--rvt-accent)]">
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
