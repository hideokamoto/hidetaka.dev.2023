import { describe, expect, it } from 'vitest'
import { SITE_CONFIG } from '@/config'
import { buildRobotsTxt } from './robotsTxt'

describe('buildRobotsTxt', () => {
  it('preserves the existing rules and sitemap line exactly as the metadata-file convention emitted them', () => {
    const txt = buildRobotsTxt()

    // Baseline captured from `next build` + `next start` on `src/app/robots.ts`
    // (the Next.js `MetadataRoute.Robots` metadata-file convention) before this
    // file replaced it with a plain Route Handler. Must not regress.
    expect(txt).toContain('User-Agent: *\n')
    expect(txt).toContain('Allow: /\n')
    expect(txt).toContain('Disallow: /private/\n')
    expect(txt).toContain('Disallow: /sentry-test\n')
    expect(txt).toContain('Disallow: /test-sentry\n')
    expect(txt).toContain('Disallow: /ja/test-sentry\n')
    expect(txt).toContain(`Sitemap: ${SITE_CONFIG.url}/sitemap.xml\n`)
  })

  it('points agents at /llms.txt as a comment line, since the metadata-file convention has no field for it', () => {
    const txt = buildRobotsTxt()

    expect(txt).toContain(`# llms.txt (AI agent guidance): ${SITE_CONFIG.url}/llms.txt`)
  })
})
