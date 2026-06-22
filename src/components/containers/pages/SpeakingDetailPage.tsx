import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import ArticleCTA from '@/components/ui/ArticleCTA'
import ArticleMeta from '@/components/ui/ArticleMeta'
import PageShell from '@/components/ui/PageShell'
import ProfileCard from '@/components/ui/ProfileCard'
import RelatedArticles from '@/components/ui/RelatedArticles'
import SidebarLayout from '@/components/ui/SidebarLayout'
import SocialShareButtons from '@/components/ui/SocialShareButtons'
import SpeakingDetailSidebar from '@/components/ui/SpeakingDetailSidebar'
import { SITE_CONFIG } from '@/config'
import type { BlogItem, WPEvent } from '@/libs/dataSources/types'

type SpeakingDetailPageProps = {
  event: WPEvent
  lang: 'ja' | 'en'
  basePath: string
  previousEvent?: WPEvent | null
  nextEvent?: WPEvent | null
  relatedEvents?: BlogItem[]
}

export default function SpeakingDetailPage({
  event,
  lang,
  basePath,
  previousEvent,
  nextEvent,
  relatedEvents = [],
}: SpeakingDetailPageProps) {
  const speakingLabel = lang === 'ja' ? '登壇・講演' : 'Speaking'
  const homeLabel = lang === 'ja' ? 'ホーム' : 'Home'
  const previousLabel = lang === 'ja' ? '前のレポート' : 'Previous Report'
  const nextLabel = lang === 'ja' ? '次のレポート' : 'Next Report'
  const relatedEventsTitle = lang === 'ja' ? '最近参加した他のイベント' : 'Other Recent Events'

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/events/${event.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

  return (
    <Container className="mt-16 sm:mt-32">
      {/* ヘッダー（パンくず + タイトル） */}
      <PageShell
        breadcrumb={[
          { label: homeLabel, href: lang === 'ja' ? '/ja' : '/' },
          { label: speakingLabel, href: basePath },
          { label: event.title.rendered },
        ]}
        title={event.title.rendered}
      />

      {/* サイドバーレイアウト（デスクトップのみ） */}
      <SidebarLayout
        sidebar={
          <SpeakingDetailSidebar
            lang={lang}
            basePath={basePath}
            previousReport={previousEvent}
            nextReport={nextEvent}
          />
        }
        sidebarWidth="narrow"
        gap="lg"
      >
        <article>
          {/* 公開日 / 更新日 */}
          <ArticleMeta published={event.date} updated={event.modified} lang={lang} />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${event.slug}`, SITE_CONFIG.url).toString()}
            title={event.title.rendered}
            lang={lang}
            className="mb-8"
          />

          {/* サムネイル画像 (OG画像) */}
          <div className="mb-8 overflow-hidden rounded-lg">
            <Image
              src={ogImageUrl}
              alt={event.title.rendered}
              width={OG_IMAGE_WIDTH}
              height={OG_IMAGE_HEIGHT}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 記事アクション（Markdown / 要約 / 翻訳） */}
          <ArticleActions
            lang={lang}
            slug={event.slug}
            basePath={basePath}
            title={event.title.rendered}
            contentHtml={event.content.rendered}
            showTranslation
            translationContentSelector="article"
          />

          {/* コンテンツ */}
          <div
            className="blog-content leading-relaxed"
            style={{ color: 'var(--rvt-fg2)' }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
            dangerouslySetInnerHTML={{ __html: event.content.rendered }}
          />

          {/* CTA */}
          <ArticleCTA lang={lang} articleType="speaking_report" className="mt-12" />

          {/* プロフィールカード（モバイルのみ表示） */}
          <div className="lg:hidden">
            <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />
          </div>

          {/* 最近参加した他のイベント */}
          <RelatedArticles articles={relatedEvents} lang={lang} title={relatedEventsTitle} />

          {/* 前後の記事へのナビゲーション（モバイルのみ表示） */}
          {(previousEvent || nextEvent) && (
            <nav
              aria-label={
                lang === 'ja' ? 'イベントレポートナビゲーション' : 'Event report navigation'
              }
              className="mt-16 pt-8 border-t lg:hidden"
              style={{ borderColor: 'var(--rvt-border)' }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* 次の記事 */}
                {nextEvent && (
                  <Link
                    href={`${basePath}/${nextEvent.slug}`}
                    aria-label={`${nextLabel}: ${nextEvent.title.rendered}`}
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
                    aria-label={`${previousLabel}: ${previousEvent.title.rendered}`}
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
      </SidebarLayout>
    </Container>
  )
}
