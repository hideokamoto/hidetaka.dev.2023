import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import DateDisplay from '@/components/ui/DateDisplay'
import Tag from '@/components/ui/Tag'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import type { FeedItem } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import type { MicroCMSEventsRecord, MicroCMSProjectsRecord } from '@/libs/microCMS/types'

// ============================================================================
// Unified Content Types & Helpers
// ============================================================================

type UnifiedContentItem =
  | { type: 'article'; data: FeedItem }
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'event'; data: MicroCMSEventsRecord }

function _getContentDate(item: UnifiedContentItem): Date {
  switch (item.type) {
    case 'article': {
      return new Date(item.data.datetime)
    }
    case 'project':
      return item.data.published_at ? new Date(item.data.published_at) : new Date(0)
    case 'event':
      return new Date(item.data.date)
  }
}

// ============================================================================
// Content Cards
// ============================================================================

function ArticleCard({
  article,
  lang,
  variant = 'default',
}: {
  article: FeedItem
  lang: string
  variant?: 'featured' | 'default'
}) {
  const href = article.href
  const title = article.title
  const description = article.description
  const datetime = article.datetime

  // Parse date properly - handle RFC 822 format from RSS feeds
  let date: Date
  try {
    date = new Date(datetime)
    // Validate date
    if (Number.isNaN(date.getTime())) {
      logger.warn('Invalid date string', { datetime, articleTitle: title })
      date = new Date() // Fallback to current date
    }
  } catch (e) {
    logger.warn('Date parsing error', {
      error: e instanceof Error ? e.message : String(e),
      datetime,
      articleTitle: title,
    })
    date = new Date() // Fallback to current date
  }

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block h-full">
        {children}
      </a>
    )
  }

  if (variant === 'featured') {
    return (
      <CardWrapper>
        <article className="relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/30 p-10 transition-all hover:border-indigo-300 hover:shadow-2xl dark:border-zinc-800 dark:from-zinc-900 dark:via-indigo-950/30 dark:to-purple-950/20 dark:hover:border-indigo-700">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
              />
              {article.dataSource && (
                <Tag variant="indigo" size="md" className="px-4 py-1.5 font-bold">
                  {article.dataSource.name}
                </Tag>
              )}
            </div>

            <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>

            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-4">
              {description}
              {description.length >= 200 ? '...' : ''}
            </p>

            <div className="mt-auto flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              <span>{lang === 'ja' ? '記事を読む' : 'Read article'}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </article>
      </CardWrapper>
    )
  }

  return (
    <CardWrapper>
      <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        <div className="flex items-center justify-between mb-3">
          <DateDisplay
            date={date}
            lang={lang}
            format="short"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          />
          {article.dataSource && (
            <Tag variant="default" size="sm" className="text-[10px]">
              {article.dataSource.name}
            </Tag>
          )}
        </div>

        <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">
          {description}
          {description.length >= 120 ? '...' : ''}
        </p>
      </article>
    </CardWrapper>
  )
}

function ProjectCard({
  project,
  lang,
  variant = 'default',
}: {
  project: MicroCMSProjectsRecord
  lang: string
  variant?: 'featured' | 'default'
}) {
  const href = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`
  const date = project.published_at ? new Date(project.published_at) : null

  if (variant === 'featured') {
    return (
      <Link href={href} className="group block">
        <article className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all hover:border-purple-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-700">
          {/* Large Image - Top */}
          {project.image && (
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={project.image.url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          {/* Content - Bottom */}
          <div className="p-8 lg:p-10">
            <div className="flex flex-col gap-4">
              {date && (
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400"
                />
              )}

              <h3 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors lg:text-3xl">
                {project.title}
              </h3>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <Tag key={tag} variant="purple" size="md">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                <span>{lang === 'ja' ? '詳細を見る' : 'View project'}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-purple-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-700">
        {/* Image - Top, larger */}
        {project.image && (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={project.image.url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content - Bottom */}
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {date && (
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
            )}

            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {project.title}
            </h3>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} variant="purple" size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

function EventCard({ event, lang }: { event: MicroCMSEventsRecord; lang: string }) {
  const date = new Date(event.date)

  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-cyan-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-700">
        <DateDisplay
          date={date}
          lang={lang}
          format="short"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400"
        />

        <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-3">
          {event.title}
        </h3>

        {event.place && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {event.place}
          </p>
        )}

        {event.session_title && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{event.session_title}</p>
        )}
      </article>
    </a>
  )
}

// ============================================================================
// Main Section - Unified Content Stream
// ============================================================================

export default async function FeaturedContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())

  // Fetch all content
  const { items: externalPosts } = await loadBlogPosts(lang === 'ja' ? 'ja' : 'en')
  const allProjects = await microCMS.listAllProjects()
  const allEvents = await microCMS.listEndedEvents()

  // Prepare unified content
  const articles: FeedItem[] = externalPosts.sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  })

  const projects = allProjects
    .filter((p) => p.published_at)
    .sort((a, b) => {
      const dateA = a.published_at || ''
      const dateB = b.published_at || ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

  const events = allEvents.slice(0, 3)

  // Get featured items (most recent)
  const featuredArticle = articles[0]
  const featuredProject = projects[0]
  const otherArticles = articles.slice(1, 4)
  const otherProjects = projects.slice(1, 4)

  const viewAllText = lang === 'ja' ? 'すべて見る' : 'View All'
  const latestArticlesText = lang === 'ja' ? '最新記事' : 'Latest Articles'
  const featuredProjectsText = lang === 'ja' ? '注目プロジェクト' : 'Featured Projects'
  const latestEventsText = lang === 'ja' ? '最新登壇' : 'Latest Speaking'

  return (
    <section className="relative py-24 sm:py-32">
      <BackgroundDecoration variant="section" />

      <Container>
        <div className="relative space-y-32">
          {/* Latest Articles Section */}
          {articles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {latestArticlesText}
                </h2>
                <Link
                  href={lang === 'ja' ? '/ja/writing' : '/writing'}
                  className="group flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all hover:text-indigo-700 hover:gap-2 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span>{viewAllText}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Featured Article */}
                {featuredArticle && (
                  <div className="lg:col-span-2">
                    <ArticleCard article={featuredArticle} lang={lang} variant="featured" />
                  </div>
                )}

                {/* Other Articles */}
                <div className="grid gap-6 lg:grid-cols-1">
                  {otherArticles.map((article) => (
                    <ArticleCard key={article.href} article={article} lang={lang} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Featured Projects Section */}
          {projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {featuredProjectsText}
                </h2>
                <Link
                  href={lang === 'ja' ? '/ja/work' : '/work'}
                  className="group flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all hover:text-indigo-700 hover:gap-2 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span>{viewAllText}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Featured Project - Full width on mobile, spans 2 columns on desktop */}
                {featuredProject && (
                  <div className="sm:col-span-2 lg:col-span-2">
                    <ProjectCard project={featuredProject} lang={lang} variant="featured" />
                  </div>
                )}

                {/* Other Projects - Compact cards */}
                {otherProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} lang={lang} />
                ))}
              </div>
            </div>
          )}

          {/* Latest Speaking Section */}
          {events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {latestEventsText}
                </h2>
                <Link
                  href={lang === 'ja' ? '/ja/speaking' : '/speaking'}
                  className="group flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all hover:text-indigo-700 hover:gap-2 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <span>{viewAllText}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
