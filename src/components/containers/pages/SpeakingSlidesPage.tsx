import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import Tag from '@/components/ui/Tag'
import type { SlideEntry } from '@/libs/speaking/slides'

function ExternalLinkIcon({ className = 'ml-1 h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

function SlideCard({ slide, lang }: { slide: SlideEntry; lang: string }) {
  return (
    <a href={slide.url} target="_blank" rel="noopener noreferrer" className="group block">
      <article
        className="relative overflow-hidden rounded-2xl transition-all hover:border-indigo-300 hover:shadow-xl"
        style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
      >
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={new Date(slide.publishedAt)}
                lang={lang}
                format="short"
                className="text-xs font-semibold [color:var(--rvt-fg2)]"
              />
              <Tag variant="default" size="sm">
                {slide.sourceName}
              </Tag>
            </div>

            <h3
              className="text-lg font-bold leading-tight transition-colors group-hover:text-indigo-600"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
              {slide.title}
            </h3>

            {slide.excerpt && (
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: 'var(--rvt-fg2)' }}
              >
                {slide.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2">
              <span
                className="flex items-center text-sm font-medium"
                style={{ color: 'var(--rvt-accent)' }}
              >
                {lang === 'ja' ? 'スライドを見る' : 'View slides'}
                <ExternalLinkIcon />
              </span>
            </div>
          </div>
        </div>
      </article>
    </a>
  )
}

export default function SpeakingSlidesPage({
  lang,
  groups,
  total,
}: {
  lang: string
  groups: { year: string; items: SlideEntry[] }[]
  total: number
}) {
  const isJa = lang === 'ja'
  const title = isJa ? 'スライド' : 'Slides'
  const description = isJa
    ? '登壇・講演で使用したスライド一覧です。'
    : 'Slide decks from talks and presentations.'
  const speakingPath = `${isJa ? '/ja' : ''}/speaking`

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12" style={{ background: 'var(--rvt-bg)' }}>
      <Container>
        <PageHeader title={title} description={description} />

        <p className="mb-8">
          <Link
            href={speakingPath}
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--rvt-accent)' }}
          >
            {isJa ? '← 登壇・講演' : '← Speaking'}
          </Link>
        </p>

        {total === 0 ? (
          <div className="py-12 text-center">
            <p style={{ color: 'var(--rvt-fg2)' }}>
              {isJa ? 'スライドが見つかりませんでした。' : 'No slides found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.year}>
                <h2
                  className="mb-6 text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg)' }}
                >
                  {group.year}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.items.map((slide) => (
                    <SlideCard key={slide.id} slide={slide} lang={lang} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
