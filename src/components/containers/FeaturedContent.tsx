import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import DateDisplay from '@/components/ui/DateDisplay'
import Tag from '@/components/ui/Tag'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import type { FeedItem } from '@/libs/dataSources/types'
import { parseDateSafely } from '@/libs/dateDisplay.utils'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

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

  // Parse date safely - returns null for invalid dates instead of falling back to current date
  const date = parseDateSafely(datetime, {
    articleTitle: title,
    source: article.dataSource?.name,
  })

  // Skip rendering article if date is invalid
  // This prevents showing articles with corrupted or missing date data
  if (!date) {
    return null
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
        <article
          className="relative h-full overflow-hidden rounded-3xl p-10 transition-all hover:border-indigo-300 hover:shadow-2xl"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-sm font-bold [color:var(--rvt-accent)]"
              />
              {article.dataSource && (
                <Tag variant="indigo" size="md" className="px-4 py-1.5 font-bold">
                  {article.dataSource.name}
                </Tag>
              )}
            </div>

            <h3
              className="text-3xl font-extrabold leading-tight tracking-tight transition-colors group-hover:text-indigo-600"
              style={{
                fontFamily: 'var(--rvt-font-display)',
                color: 'var(--rvt-fg)',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </h3>

            <p
              className="text-base leading-relaxed line-clamp-4"
              style={{ color: 'var(--rvt-fg2)' }}
            >
              {description}
              {description.length >= 200 ? '...' : ''}
            </p>

            <div
              className="mt-auto flex items-center gap-2 text-sm font-bold"
              style={{ color: 'var(--rvt-accent)' }}
            >
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
      <article
        className="flex h-full flex-col rounded-xl p-6 transition-all hover:border-indigo-300 hover:shadow-lg"
        style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <DateDisplay
            date={date}
            lang={lang}
            format="short"
            className="text-xs font-semibold [color:var(--rvt-fg2)]"
          />
          {article.dataSource && (
            <Tag variant="default" size="sm" className="text-[10px]">
              {article.dataSource.name}
            </Tag>
          )}
        </div>

        <h3
          className="text-lg font-bold leading-tight transition-colors group-hover:text-indigo-600 mb-3"
          style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
        >
          {title}
        </h3>

        <p
          className="text-sm leading-relaxed line-clamp-2 flex-1"
          style={{ color: 'var(--rvt-fg2)' }}
        >
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
        <article
          className="relative overflow-hidden rounded-3xl transition-all hover:border-indigo-300 hover:shadow-2xl"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
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

          <div className="p-8 lg:p-10">
            <div className="flex flex-col gap-4">
              {date && (
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-sm font-semibold [color:var(--rvt-accent)]"
                />
              )}

              <h3
                className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-indigo-600 lg:text-3xl"
                style={{
                  fontFamily: 'var(--rvt-font-display)',
                  color: 'var(--rvt-fg)',
                  letterSpacing: '-0.03em',
                }}
              >
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

              <div
                className="mt-4 flex items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--rvt-accent)' }}
              >
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
      <article
        className="relative overflow-hidden rounded-2xl transition-all hover:border-indigo-300 hover:shadow-xl"
        style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
      >
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

        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {date && (
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold [color:var(--rvt-fg2)]"
              />
            )}

            <h3
              className="text-lg font-bold leading-tight transition-colors group-hover:text-indigo-600"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
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

// ============================================================================
// Main Section - Unified Content Stream
// ============================================================================

export default async function FeaturedContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())

  // Fetch all content
  const { items: externalPosts } = await loadBlogPosts(lang === 'ja' ? 'ja' : 'en')
  const allProjects = await microCMS.listAllProjects()

  // Prepare unified content
  // Filter articles with valid dates to prevent ArticleCard from returning null
  const articles: FeedItem[] = externalPosts
    .map((article) => ({
      article,
      date: parseDateSafely(article.datetime, {
        articleTitle: article.title,
        source: article.dataSource?.name,
      }),
    }))
    .filter((item): item is { article: FeedItem; date: Date } => item.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ article }) => article)

  const projects = allProjects
    .filter((p) => p.published_at)
    .sort((a, b) => {
      const dateA = a.published_at || ''
      const dateB = b.published_at || ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

  // Get featured items (most recent)
  const featuredArticle = articles[0]
  const featuredProject = projects[0]
  const otherArticles = articles.slice(1, 4)
  const otherProjects = projects.slice(1, 4)

  const viewAllText = lang === 'ja' ? 'すべて見る' : 'View All'
  const latestArticlesText = lang === 'ja' ? '最新記事' : 'Latest Articles'
  const featuredProjectsText = lang === 'ja' ? '注目プロジェクト' : 'Featured Projects'

  return (
    <section className="relative py-24 sm:py-32">
      <BackgroundDecoration variant="section" />

      <Container>
        <div className="relative space-y-32">
          {/* Latest Articles Section */}
          {articles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-12">
                <h2
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{
                    fontFamily: 'var(--rvt-font-display)',
                    color: 'var(--rvt-fg)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {latestArticlesText}
                </h2>
                <Link
                  href={lang === 'ja' ? '/ja/writing' : '/writing'}
                  className="group flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-80 hover:gap-2"
                  style={{ color: 'var(--rvt-accent)' }}
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
                <h2
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{
                    fontFamily: 'var(--rvt-font-display)',
                    color: 'var(--rvt-fg)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {featuredProjectsText}
                </h2>
                <Link
                  href={lang === 'ja' ? '/ja/work' : '/work'}
                  className="group flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-80 hover:gap-2"
                  style={{ color: 'var(--rvt-accent)' }}
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
        </div>
      </Container>
    </section>
  )
}
