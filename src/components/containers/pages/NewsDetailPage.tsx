import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import DateDisplay from '@/components/ui/DateDisplay'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import BlogReactions from '@/components/ui/reactions/BlogReactions'
import SocialShareButtons from '@/components/ui/SocialShareButtons'
import { SITE_CONFIG } from '@/config'
import type { WPProduct } from '@/libs/dataSources/products'
import type { BlogItem } from '@/libs/dataSources/types'
import { DETAIL_PAGE_SECTION_CLASS } from '@/libs/utils/detailPageStyles'

type NewsDetailPageProps = {
  product: WPProduct
  lang: 'ja' | 'en'
  basePath: string
  previousProduct?: WPProduct | null
  nextProduct?: WPProduct | null
  relatedArticles?: BlogItem[]
  enableHatenaStar: boolean
}

export default function NewsDetailPage({
  product,
  lang,
  basePath,
  previousProduct,
  nextProduct,
  relatedArticles = [],
  enableHatenaStar,
}: NewsDetailPageProps) {
  const date = new Date(product.date)
  const newsLabel = lang === 'ja' ? 'ニュース' : 'News'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next'

  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href={basePath}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  {newsLabel}
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
                  {product.title.rendered}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* タイトル */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {product.title.rendered}
          </h1>
        </header>

        {/* 日付 */}
        <div className="mb-10 flex flex-col gap-4">
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          />
        </div>

        {/* 記事アクション（Markdown / 要約 / 翻訳） */}
        <ArticleActions
          lang={lang}
          slug={product.slug}
          basePath={basePath}
          title={product.title.rendered}
          contentHtml={product.content.rendered}
          showTranslation
          translationContentSelector="article"
        />

        {/* コンテンツ */}
        <div
          className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
          dangerouslySetInnerHTML={{ __html: product.content.rendered }}
        />

        {/* プロフィールカード */}
        <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />

        {/* SNS共有ボタン */}
        <SocialShareButtons
          url={new URL(`${basePath}/${product.slug}`, SITE_CONFIG.url).toString()}
          title={product.title.rendered}
          lang={lang}
          className={DETAIL_PAGE_SECTION_CLASS}
        />

        {/* リアクション機能 */}
        <BlogReactions
          url={new URL(`${basePath}/${product.slug}`, SITE_CONFIG.url).toString()}
          title={product.title.rendered}
          slug={product.slug}
          lang={lang}
          enableHatenaStar={enableHatenaStar}
          className={DETAIL_PAGE_SECTION_CLASS}
        />

        {/* CTA（コールトゥアクション） */}
        <ArticleCTA articleType="tool_announcement" lang={lang} />

        {/* 関連記事 */}
        <RelatedArticles articles={relatedArticles} lang={lang} />

        {/* 前後の記事へのナビゲーション */}
        {(previousProduct || nextProduct) && (
          <nav
            aria-label="記事ナビゲーション"
            className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* 次の記事 */}
              {nextProduct && (
                <Link
                  href={`${basePath}/${nextProduct.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    ← {nextLabel}
                  </span>
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {nextProduct.title.rendered}
                  </span>
                </Link>
              )}

              {/* 前の記事 */}
              {previousProduct && (
                <Link
                  href={`${basePath}/${previousProduct.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-right"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    {previousLabel} →
                  </span>
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {previousProduct.title.rendered}
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
