import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import type { FeedItem } from '@/libs/dataSources/types'
import type { MicroCMSProjectsRecord, MicroCMSPostsRecord, MicroCMSEventsRecord } from '@/lib/microCMS/types'

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl">
      {children}
    </h2>
  )
}

function ArticleCard({ article, lang }: { article: FeedItem | MicroCMSPostsRecord; lang: string }) {
  const isFeedItem = 'dataSource' in article
  const href = isFeedItem 
    ? article.href 
    : (lang === 'ja' ? `/ja/writing/${article.id}` : `/writing/${article.id}`)
  const title = isFeedItem ? article.title : article.title
  const description = isFeedItem 
    ? article.description 
    : article.content.replace(/<[^>]*>/g, '').substring(0, 150)
  const datetime = isFeedItem ? article.datetime : article.publishedAt

  return (
    <article className="group relative flex flex-col items-start">
      <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
        {isFeedItem ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {title}
          </a>
        ) : (
          <Link href={href} className="hover:text-indigo-600 dark:hover:text-indigo-400">{title}</Link>
        )}
      </h3>
      <time
        dateTime={datetime}
        className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500"
      >
        {formatDate(datetime, lang)}
      </time>
      <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
        {description.length >= 150 ? '...' : ''}
      </p>
      {isFeedItem && article.dataSource && (
        <div className="relative z-10 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <a href={article.dataSource.href} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-700 dark:hover:text-zinc-300">
            {article.dataSource.name}
          </a>
        </div>
      )}
    </article>
  )
}

function ProjectCard({ project, lang }: { project: MicroCMSProjectsRecord; lang: string }) {
  const href = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`

  return (
    <article className="group relative flex flex-col items-start">
      <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
        <Link href={href} className="hover:text-indigo-600 dark:hover:text-indigo-400">{project.title}</Link>
      </h3>
      {project.published_at && (
        <time
          dateTime={project.published_at}
          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500"
        >
          {formatDate(project.published_at, lang)}
        </time>
      )}
      {project.tags && project.tags.length > 0 && (
        <div className="relative z-10 mb-2 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

function EventCard({ event, lang }: { event: MicroCMSEventsRecord; lang: string }) {
  return (
    <article className="group relative flex flex-col items-start">
      <h3 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          {event.title}
        </a>
      </h3>
      <time
        dateTime={event.date}
        className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500"
      >
        {formatDate(event.date, lang)}
      </time>
      {event.place && (
        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {event.place}
        </p>
      )}
      {event.session_title && (
        <p className="relative z-10 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {event.session_title}
        </p>
      )}
    </article>
  )
}

export default async function FeaturedContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  
  // 最新記事を取得（外部記事と独自記事から）
  const externalPosts = await loadBlogPosts(lang === 'ja' ? 'ja' : 'en')
  const newsPosts = await microCMS.listPosts({ lang: lang === 'ja' ? 'japanese' : 'english' })
  
  // 全記事を統合して日付順にソート
  const allArticles: Array<FeedItem | MicroCMSPostsRecord> = [
    ...externalPosts,
    ...newsPosts,
  ].sort((a, b) => {
    const dateA = 'datetime' in a ? a.datetime : a.publishedAt
    const dateB = 'datetime' in b ? b.datetime : b.publishedAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
  
  const latestArticles = allArticles.slice(0, 5)
  
  // 注目プロジェクトを取得
  const allProjects = await microCMS.listAllProjects()
  const featuredProjects = allProjects
    .filter((p) => p.published_at)
    .sort((a, b) => {
      const dateA = a.published_at || ''
      const dateB = b.published_at || ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .slice(0, 5)
  
  // 最新登壇情報を取得
  const recentEvents = await microCMS.listEndedEvents()
  const latestEvents = recentEvents.slice(0, 3)

  const viewAllText = lang === 'ja' ? 'すべて見る' : 'View All'
  const latestArticlesText = lang === 'ja' ? '最新記事' : 'Latest Articles'
  const featuredProjectsText = lang === 'ja' ? '注目プロジェクト' : 'Featured Projects'
  const latestEventsText = lang === 'ja' ? '最新登壇' : 'Latest Speaking'

  return (
    <Container className="mt-24 md:mt-28">
      <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 lg:gap-y-32">
        {/* 最新記事 */}
        <div className="flex flex-col gap-16">
          <div className="flex items-center justify-between">
            <SectionTitle>{latestArticlesText}</SectionTitle>
            <Link
              href={lang === 'ja' ? '/ja/writing' : '/writing'}
              className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              {viewAllText} →
            </Link>
          </div>
          <div className="flex flex-col gap-16">
            {latestArticles.map((article, index) => (
              <ArticleCard key={index} article={article} lang={lang} />
            ))}
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-20 lg:pl-16 xl:pl-24">
          {/* 注目プロジェクト */}
          {featuredProjects.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <SectionTitle>{featuredProjectsText}</SectionTitle>
                <Link
                  href={lang === 'ja' ? '/ja/work' : '/work'}
                  className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  {viewAllText} →
                </Link>
              </div>
              <div className="flex flex-col gap-8">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} lang={lang} />
                ))}
              </div>
            </div>
          )}

          {/* 最新登壇情報 */}
          {latestEvents.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <SectionTitle>{latestEventsText}</SectionTitle>
                <Link
                  href={lang === 'ja' ? '/ja/speaking' : '/speaking'}
                  className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  {viewAllText} →
                </Link>
              </div>
              <div className="flex flex-col gap-8">
                {latestEvents.map((event) => (
                  <EventCard key={event.id} event={event} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
