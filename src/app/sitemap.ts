import { MetadataRoute } from 'next'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'
import { loadThoughts } from '@/libs/dataSources/thoughts'

const SITE_URL = 'https://hidetaka.dev'

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
  const staticPages: MetadataRoute.Sitemap = [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...jaStaticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/ja' ? 1 : 0.8,
    })),
  ]

  // ブログ記事（WordPress API、日本語のみ）
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const thoughtsResult = await loadThoughts(1, 100, 'ja')
    blogPages = thoughtsResult.items.map((item) => ({
      url: `${SITE_URL}${item.href}`,
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
    projectPages = projects.flatMap((project) => [
      {
        url: `${SITE_URL}/projects/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/ja/projects/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/work/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/ja/work/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
    ])
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
      ...enPosts.map((post) => ({
        url: `${SITE_URL}/writing/${post.id}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...jaPosts.map((post) => ({
        url: `${SITE_URL}/ja/writing/${post.id}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
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
    eventPages = allEvents.flatMap((event) => [
      {
        url: `${SITE_URL}/news/${event.id}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/ja/news/${event.id}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
    ])
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
