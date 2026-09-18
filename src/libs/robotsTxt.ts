import { SITE_CONFIG } from '@/config'

/**
 * Builds the content served at `/robots.txt`.
 *
 * This used to be `src/app/robots.ts` using Next.js's `MetadataRoute.Robots` metadata-file
 * convention, which only knows how to emit `User-Agent:`/`Allow:`/`Disallow:`/`Crawl-delay:`/
 * `Host:`/`Sitemap:` lines (see `resolveRobots` in `next/dist/build/webpack/loaders/metadata/
 * resolve-route-data.js`) — there is no field for an arbitrary comment line. Pointing agents
 * at `/llms.txt` needs exactly that, so this is now a plain Route Handler instead. The
 * rules/sitemap output below is otherwise unchanged from the metadata-file version.
 */
export function buildRobotsTxt(): string {
  const lines: string[] = [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /private/',
    'Disallow: /sentry-test',
    'Disallow: /test-sentry',
    'Disallow: /ja/test-sentry',
    '',
    `Sitemap: ${SITE_CONFIG.url}/sitemap.xml`,
    '',
    `# llms.txt (AI agent guidance): ${SITE_CONFIG.url}/llms.txt`,
  ]

  return `${lines.join('\n')}\n`
}
