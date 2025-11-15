import Link from 'next/link'
import Image from 'next/image'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import Tag from '@/components/ui/Tag'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPEvent } from '@/libs/dataSources/types'

type SpeakingDetailPageProps = {
  event: WPEvent
  lang: string
  basePath: string
}

export default function SpeakingDetailPage({
  event,
  lang,
  basePath,
}: SpeakingDetailPageProps) {
  const date = new Date(event.date)
  const speakingLabel = lang === 'ja' ? '登壇・講演' : 'Speaking'
  const reportLabel = lang === 'ja' ? 'レポート' : 'Report'

  // OG画像のURLを生成
  const ogImageUrl = `/api/thumbnail/events/${event.id}`
  const OG_IMAGE_WIDTH = 1200
  const OG_IMAGE_HEIGHT = 630

  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol role="list" className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href={basePath}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  {speakingLabel}
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
                  {event.title.rendered}
                </span>
              </div>
            </li>
          </ol>
        </nav>

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

        {/* タイトル */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {event.title.rendered}
          </h1>
        </header>

        {/* 日付とタイプバッジ */}
        <div className="mb-10 flex flex-col gap-4">
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          />
          <div className="flex flex-wrap gap-2">
            <Tag variant="purple" size="sm">
              {reportLabel}
            </Tag>
          </div>
        </div>

        {/* コンテンツ */}
        <div
          className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: event.content.rendered }}
        />

        {/* プロフィールカード */}
        <ProfileCard lang={lang} imageSrc="/images/profile.jpg" className="mt-12" />
      </article>
    </Container>
  )
}

