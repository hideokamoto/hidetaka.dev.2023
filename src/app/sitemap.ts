import { MetadataRoute } from 'next'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import { loadThoughts } from '@/libs/dataSources/thoughts'
import { SITE_CONFIG } from '@/config'

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * 複数のベースパスに対して同じコンテンツのsitemapエントリを生成するヘルパー関数
 */
const createEntriesForPaths = (
  basePaths: string[],
  id: string,
  lastModified?: Date,
  changeFrequency: SitemapEntry['changeFrequency'] = 'monthly',
  priority: number = 0.7
): SitemapEntry[] => {
  return basePaths.map((basePath) => ({
    url: `${SITE_CONFIG.url}${basePath}/${id}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())

  // 静的ページ（英語版）
  const staticRoutes = [
    '',
    '/about',
    '/articles',
    '/blog',
    '/news',
    '/oss',
    '/projects',
    '/speaking',
    '/work',
    '/writing',
  ]

  // 静的ページ（日本語版）
  const jaStaticRoutes = [
    '/ja',
    '/ja/about',
    '/ja/articles',
    '/ja/blog',
    '/ja/news',
    '/ja/oss',
    '/ja/projects',
    '/ja/speaking',
    '/ja/work',
    '/ja/writing',
  ]

  // 静的ページのsitemapエントリ
  // lastModifiedは省略（ビルドごとに日付が変わらないようにする）
  const staticPages: MetadataRoute.Sitemap = [
    ...staticRoutes.map((route) => ({
      url: `${SITE_CONFIG.url}${route}`,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...jaStaticRoutes.map((route) => ({
      url: `${SITE_CONFIG.url}${route}`,
      changeFrequency: 'weekly' as const,
      priority: route === '/ja' ? 1 : 0.8,
    })),
  ]

  // ブログ記事（WordPress API、日本語のみ）
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const thoughtsResult = await loadThoughts(1, 100, 'ja')
    blogPages = thoughtsResult.items.map((item) => ({
      url: `${SITE_CONFIG.url}${item.href}`,
      lastModified: new Date(item.datetime),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error loading blog posts for sitemap:', error)
  }

  // プロジェクト
  let projectPages: MetadataRoute.Sitemap = []
  try {
    const projects = await microCMS.listAllProjects()
    projectPages = projects.flatMap((project) => {
      const lastModified = project.updatedAt ? new Date(project.updatedAt) : undefined
      return createEntriesForPaths(
        ['/projects', '/ja/projects', '/work', '/ja/work'],
        project.id,
        lastModified,
        'monthly',
        0.7
      )
    })
  } catch (error) {
    console.error('Error loading projects for sitemap:', error)
  }

  // 投稿記事
  let postPages: MetadataRoute.Sitemap = []
  try {
    const [enPosts, jaPosts] = await Promise.all([
      microCMS.listPosts({ lang: 'english' }),
      microCMS.listPosts({ lang: 'japanese' }),
    ])

    postPages = [
      ...enPosts.flatMap((post) => {
        const lastModified = post.updatedAt ? new Date(post.updatedAt) : undefined
        return createEntriesForPaths(['/writing'], post.id, lastModified, 'monthly', 0.7)
      }),
      ...jaPosts.flatMap((post) => {
        const lastModified = post.updatedAt ? new Date(post.updatedAt) : undefined
        return createEntriesForPaths(['/ja/writing'], post.id, lastModified, 'monthly', 0.7)
      }),
    ]
  } catch (error) {
    console.error('Error loading posts for sitemap:', error)
  }

  // イベント
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const [upcomingEvents, endedEvents] = await Promise.all([
      microCMS.listUpcomingEvents(),
      microCMS.listEndedEvents(),
    ])

    const allEvents = [...upcomingEvents, ...endedEvents]
    eventPages = allEvents.flatMap((event) => {
      const lastModified = event.updatedAt ? new Date(event.updatedAt) : undefined
      return createEntriesForPaths(['/news', '/ja/news'], event.id, lastModified, 'monthly', 0.6)
    })
  } catch (error) {
    console.error('Error loading events for sitemap:', error)
  }

  return [
    ...staticPages,
    ...blogPages,
    ...projectPages,
    ...postPages,
    ...eventPages,
  ]
}
