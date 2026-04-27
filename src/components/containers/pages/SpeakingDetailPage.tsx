import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import ArticleActions from '@/components/ui/ArticleActions'
import DateDisplay from '@/components/ui/DateDisplay'
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
  const date = new Date(event.date)
  const speakingLabel = lang === 'ja' ? '登壇・講演' : 'Speaking'
  const previousLabel = lang === 'ja' ? '前のレポート' : 'Previous Report'
  const nextLabel = lang === 'ja' ? '次のレポート' : 'Next Report'
  const relatedEventsTitle = lang === 'ja' ? '最近参加した他のイベント' : 'Other Recent Events'

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/events/${event.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

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
            <Link
              href={basePath}
              aria-label={lang === 'ja' ? `${speakingLabel}に戻る` : `Go to ${speakingLabel}`}
              style={{ color: 'var(--color-muted)' }}
            >
              {speakingLabel}
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
            {event.title.rendered}
          </li>
        </ol>
      </nav>

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
          {/* 日付（タイトルの上に移動） */}
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="mb-4 text-sm lg:text-base font-medium text-slate-600 dark:text-slate-400"
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
              {event.title.rendered}
            </h1>
          </header>

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
            className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted WordPress CMS, controlled by site owner
            dangerouslySetInnerHTML={{ __html: event.content.rendered }}
          />

          {/* SNS共有ボタン */}
          <SocialShareButtons
            url={new URL(`${basePath}/${event.slug}`, SITE_CONFIG.url).toString()}
            title={event.title.rendered}
            lang={lang}
            className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700"
          />

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
              className="ds-pagination lg:hidden"
              style={{ marginTop: '4rem' }}
            >
              <div>
                {nextEvent && (
                  <Link
                    href={`${basePath}/${nextEvent.slug}`}
                    className="ds-btn ds-btn--ghost ds-btn--sm"
                  >
                    ← {nextLabel}
                  </Link>
                )}
              </div>
              <div>
                {previousEvent && (
                  <Link
                    href={`${basePath}/${previousEvent.slug}`}
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
