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
  const date = new Date(event.date)
  const eventLabel = lang === 'ja' ? 'イベント' : 'Event'
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
                  className="font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  style={{ color: 'var(--rvt-fg2)' }}
                >
                  {eventLabel}
                </Link>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-2 size-5 shrink-0 text-slate-300"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <span
                  className="font-medium text-slate-900 line-clamp-1"
                  style={{ color: 'var(--rvt-fg)' }}
                >
                  {event.title.rendered}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* タイトル */}
        <header className="mb-6">
          <h1
            className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl"
            style={{ color: 'var(--rvt-fg)' }}
          >
            {event.title.rendered}
          </h1>
        </header>

        {/* 日付 */}
        <div className="mb-10 flex flex-col gap-4">
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="text-sm font-medium [color:var(--rvt-fg2)]"
          />
        </div>

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

        {/* SNS共有ボタン */}
        <SocialShareButtons
          url={new URL(`${basePath}/${event.slug}`, SITE_CONFIG.url).toString()}
          title={event.title.rendered}
          lang={lang}
          className={DETAIL_PAGE_SECTION_CLASS}
        />

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
            className="mt-16 pt-8 border-t border-zinc-200"
            style={{ borderColor: 'var(--rvt-border)' }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {/* 次の記事 */}
              {nextEvent && (
                <Link
                  href={`${basePath}/${nextEvent.slug}`}
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  style={{ borderColor: 'var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                >
                  <span
                    className="text-sm font-medium text-zinc-500 mb-1"
                    style={{ color: 'var(--rvt-fg2)' }}
                  >
                    ← {nextLabel}
                  </span>
                  <span
                    className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-2"
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
                  className="group flex flex-col flex-1 p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-right"
                  style={{ borderColor: 'var(--rvt-border)', background: 'var(--rvt-bg2)' }}
                >
                  <span
                    className="text-sm font-medium text-zinc-500 mb-1"
                    style={{ color: 'var(--rvt-fg2)' }}
                  >
                    {previousLabel} →
                  </span>
                  <span
                    className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-2"
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
