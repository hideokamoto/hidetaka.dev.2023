import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
