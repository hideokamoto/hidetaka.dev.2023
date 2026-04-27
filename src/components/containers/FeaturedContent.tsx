import Link from 'next/link'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import type { FeedItem } from '@/libs/dataSources/types'
import { parseDateSafely } from '@/libs/dateDisplay.utils'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

function WriteRow({ no, item }: { no: string; item: FeedItem }) {
  const date = parseDateSafely(item.datetime, {
    articleTitle: item.title,
    source: item.dataSource?.name,
  })
  if (!date) return null
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const source = item.dataSource?.name ?? ''
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className="ds-entry">
      <span className="ds-entry__no">{no}</span>
      <p className="ds-entry__title">{item.title}</p>
      <span className="ds-entry__date">
        {source ? `${source} · ` : ''}
        {dateStr}
      </span>
    </a>
  )
}

function ProjectRow({
  no,
  project,
  lang,
}: {
  no: string
  project: MicroCMSProjectsRecord
  lang: string
}) {
  const href = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`
  const date = project.published_at ? new Date(project.published_at) : null
  const dateStr = date
    ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
    : ''
  const tags = project.tags?.slice(0, 2).join(' · ') ?? ''
  return (
    <Link href={href} className="ds-entry">
      <span className="ds-entry__no">{no}</span>
      <p className="ds-entry__title">{project.title}</p>
      <span className="ds-entry__date">
        {tags}
        {tags && dateStr ? ' · ' : ''}
        {dateStr}
      </span>
    </Link>
  )
}

export default async function FeaturedContent({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')
  const microCMS = new MicroCMSAPI(createMicroCMSClient())

  const { items: externalPosts } = await loadBlogPosts(isJa ? 'ja' : 'en')
  const allProjects = await microCMS.listAllProjects()

  const articles: FeedItem[] = externalPosts
    .map((a) => ({
      a,
      date: parseDateSafely(a.datetime, { articleTitle: a.title, source: a.dataSource?.name }),
    }))
    .filter((x): x is { a: FeedItem; date: Date } => x.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ a }) => a)
    .slice(0, 5)

  const projects = allProjects
    .filter((p) => p.published_at)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, 5)

  return (
    <section
      style={{
        borderTop: '1px solid var(--color-line-strong)',
        borderBottom: '1px solid var(--color-line-strong)',
      }}
    >
      <div className="mx-auto max-w-[1440px] px-8 sm:px-16 py-16">
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}
          className="lg:grid-cols-2"
        >
          {/* Writing column */}
          <div>
            <div className="ds-sec-header" style={{ marginBottom: '0.5rem' }}>
              <span className="ds-sec-header__no">W</span>
              <h2 className="ds-sec-header__title">
                {isJa ? '執筆' : 'Writing'}
                <small
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    fontWeight: 400,
                    marginTop: '4px',
                  }}
                >
                  {isJa ? '記事・連載' : 'Articles & Series'}
                </small>
              </h2>
              <Link href={isJa ? '/ja/writing' : '/writing'} className="ds-sec-header__action">
                {isJa ? '一覧へ →' : 'View all →'}
              </Link>
            </div>
            {articles.map((a, i) => (
              <WriteRow key={a.href} no={String(i + 1).padStart(3, '0')} item={a} />
            ))}
          </div>

          {/* Projects column */}
          <div>
            <div className="ds-sec-header" style={{ marginBottom: '0.5rem' }}>
              <span className="ds-sec-header__no">P</span>
              <h2 className="ds-sec-header__title">
                {isJa ? 'プロジェクト' : 'Projects'}
                <small
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    fontWeight: 400,
                    marginTop: '4px',
                  }}
                >
                  {isJa ? 'プロジェクト・OSS' : 'Projects & OSS'}
                </small>
              </h2>
              <Link href={isJa ? '/ja/work' : '/work'} className="ds-sec-header__action">
                {isJa ? '一覧へ →' : 'View all →'}
              </Link>
            </div>
            {projects.map((p, i) => (
              <ProjectRow
                key={p.id}
                no={`A/${String(i + 1).padStart(2, '0')}`}
                project={p}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
