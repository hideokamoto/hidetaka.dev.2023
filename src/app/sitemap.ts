import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config'
import { loadAllDevNotes } from '@/libs/dataSources/devnotes'
import { loadAllProducts } from '@/libs/dataSources/products'
import { loadAllThoughts } from '@/libs/dataSources/thoughts'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Helper function to generate sitemap entries for the same content across multiple base paths
 */
const createEntriesForPaths = (
  basePaths: string[],
  id: string,
  lastModified?: Date,
  changeFrequency: SitemapEntry['changeFrequency'] = 'monthly',
  priority: number = 0.7,
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

  // Static pages (English version)
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

  // Static pages (Japanese version)
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

  // Sitemap entries for static pages
  // lastModified is omitted (to prevent date changes on each build)
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

  // Blog posts (WordPress API, Japanese only)
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const allThoughts = await loadAllThoughts('ja')
    blogPages = allThoughts.map((item) => ({
      url: `${SITE_CONFIG.url}${item.href}`,
      lastModified: new Date(item.datetime),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error loading blog posts for sitemap:', error)
  }

  // Projects
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
        0.7,
      )
    })
  } catch (error) {
    console.error('Error loading projects for sitemap:', error)
  }

  // Product news (WordPress API products)
  let productNewsPages: MetadataRoute.Sitemap = []
  try {
    const allProducts = await loadAllProducts()
    productNewsPages = allProducts.flatMap((product) => {
      const lastModified = product.modified ? new Date(product.modified) : undefined
      return createEntriesForPaths(
        ['/news', '/ja/news'],
        product.slug,
        lastModified,
        'monthly',
        0.7,
      )
    })
  } catch (error) {
    console.error('Error loading product news for sitemap:', error)
  }

  // Dev Notes (WordPress API, Japanese only)
  let devNotesPages: MetadataRoute.Sitemap = []
  try {
    const allDevNotes = await loadAllDevNotes()
    devNotesPages = allDevNotes.map((item) => ({
      url: `${SITE_CONFIG.url}${item.href}`,
      lastModified: new Date(item.datetime),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error loading dev-notes for sitemap:', error)
  }

  return [...staticPages, ...blogPages, ...projectPages, ...productNewsPages, ...devNotesPages]
}
