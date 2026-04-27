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
                {newsLabel}
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
              {product.title.rendered}
            </li>
          </ol>
        </nav>

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
            className="ds-pagination"
            style={{ marginTop: '4rem' }}
          >
            <div>
              {nextProduct && (
                <Link
                  href={`${basePath}/${nextProduct.slug}`}
                  className="ds-btn ds-btn--ghost ds-btn--sm"
                >
                  ← {nextLabel}
                </Link>
              )}
            </div>
            <div>
              {previousProduct && (
                <Link
                  href={`${basePath}/${previousProduct.slug}`}
                  className="ds-btn ds-btn--ghost ds-btn--sm"
                >
                  {previousLabel} →
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </Container>
  )
}
