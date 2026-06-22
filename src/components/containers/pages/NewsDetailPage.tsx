import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import ArticleMeta from '@/components/ui/ArticleMeta'
import PageShell from '@/components/ui/PageShell'
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
  const newsLabel = lang === 'ja' ? 'ニュース' : 'News'
  const homeLabel = lang === 'ja' ? 'ホーム' : 'Home'
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next'

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー（パンくず + タイトル） */}
        <PageShell
          breadcrumb={[
            { label: homeLabel, href: lang === 'ja' ? '/ja' : '/' },
            { label: newsLabel, href: basePath },
            { label: product.title.rendered },
          ]}
          title={product.title.rendered}
        />
      </div>
      <article className="max-w-3xl mx-auto">
        {/* 公開日 / 更新日 */}
        <ArticleMeta published={product.date} updated={product.modified} lang={lang} />

        {/* SNS共有ボタン */}
        <SocialShareButtons
          url={new URL(`${basePath}/${product.slug}`, SITE_CONFIG.url).toString()}
          title={product.title.rendered}
          lang={lang}
          className="mb-8"
        />

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
          className="blog-content leading-relaxed"
          style={{ color: 'var(--rvt-fg2)' }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
          dangerouslySetInnerHTML={{ __html: product.content.rendered }}
        />

        {/* プロフィールカード */}
        <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />

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
        <ArticleCTA articleType="news_article" lang={lang} className="mt-12" />

        {/* 関連記事 */}
        <RelatedArticles articles={relatedArticles} lang={lang} />

        {/* 前後の記事へのナビゲーション */}
        {(previousProduct || nextProduct) && (
          <nav
            aria-label="記事ナビゲーション"
            className="mt-16 pt-8 border-t"
            style={{ borderColor: 'var(--rvt-border)' }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* 次の記事 */}
              {nextProduct && (
                <Link
                  href={`${basePath}/${nextProduct.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg transition-colors"
                  style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                >
                  <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                    ← {nextLabel}
                  </span>
                  <span className="text-base font-semibold transition-colors line-clamp-2 text-[var(--rvt-fg)] group-hover:text-[var(--rvt-accent)]">
                    {nextProduct.title.rendered}
                  </span>
                </Link>
              )}

              {/* 前の記事 */}
              {previousProduct && (
                <Link
                  href={`${basePath}/${previousProduct.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg transition-colors text-right"
                  style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                >
                  <span className="text-sm font-medium mb-1" style={{ color: 'var(--rvt-fg2)' }}>
                    {previousLabel} →
                  </span>
                  <span className="text-base font-semibold transition-colors line-clamp-2 text-[var(--rvt-fg)] group-hover:text-[var(--rvt-accent)]">
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
