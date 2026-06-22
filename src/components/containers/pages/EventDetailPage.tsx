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
import type { BlogItem, WPEvent } from '@/libs/dataSources/types'
import { DETAIL_PAGE_SECTION_CLASS } from '@/libs/utils/detailPageStyles'

type EventDetailPageProps = {
  event: WPEvent
  lang: 'ja' | 'en'
  basePath: string
  previousEvent?: WPEvent | null
  nextEvent?: WPEvent | null
  relatedEvents?: BlogItem[]
  enableHatenaStar: boolean
}

export default function EventDetailPage({
  event,
  lang,
  basePath,
  previousEvent,
  nextEvent,
  relatedEvents = [],
  enableHatenaStar,
}: EventDetailPageProps) {
  const eventLabel = lang === 'ja' ? 'イベント' : 'Event'
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
            { label: eventLabel, href: basePath },
            { label: event.title.rendered },
          ]}
          title={event.title.rendered}
        />
      </div>
      <article className="max-w-3xl mx-auto">
        {/* 公開日 / 更新日 */}
        <ArticleMeta published={event.date} updated={event.modified} lang={lang} />

        {/* SNS共有ボタン */}
        <SocialShareButtons
          url={new URL(`${basePath}/${event.slug}`, SITE_CONFIG.url).toString()}
          title={event.title.rendered}
          lang={lang}
          className="mb-8"
        />

        {/* 記事アクション（Markdown / 要約） */}
        <ArticleActions
          lang={lang}
          slug={event.slug}
          basePath={basePath}
          title={event.title.rendered}
          contentHtml={event.content.rendered}
        />

        {/* コンテンツ */}
        <div
          className="blog-content leading-relaxed"
          style={{ color: 'var(--rvt-fg2)' }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
          dangerouslySetInnerHTML={{ __html: event.content.rendered }}
        />

        {/* プロフィールカード */}
        <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />

        {/* CTA */}
        <ArticleCTA lang={lang} articleType="event_report" className="mt-12" />

        {/* リアクション機能 */}
        <BlogReactions
          url={new URL(`${basePath}/${event.slug}`, SITE_CONFIG.url).toString()}
          title={event.title.rendered}
          slug={event.slug}
          lang={lang}
          enableHatenaStar={enableHatenaStar}
          className={DETAIL_PAGE_SECTION_CLASS}
        />

        {/* 関連記事 */}
        <RelatedArticles articles={relatedEvents} lang={lang} />

        {/* 前後の記事へのナビゲーション */}
        {(previousEvent || nextEvent) && (
          <nav
            aria-label="記事ナビゲーション"
            className="mt-16 pt-8 border-t"
            style={{ borderColor: 'var(--rvt-border)' }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* 次の記事 */}
              {nextEvent && (
                <Link
                  href={`${basePath}/${nextEvent.slug}`}
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
                    {nextEvent.title.rendered}
                  </span>
                </Link>
              )}

              {/* 前の記事 */}
              {previousEvent && (
                <Link
                  href={`${basePath}/${previousEvent.slug}`}
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
                    {previousEvent.title.rendered}
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
