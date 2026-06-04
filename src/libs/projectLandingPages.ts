/**
 * Project landing pages
 *
 * A few "Work" entries are NOT rendered by the Next.js `/work/[slug]` detail
 * route. Instead they have a dedicated landing page (LP) that is served as a
 * separate Cloudflare Worker mounted under a path prefix of this site
 * (see the wordpress-skills repo's `wrangler.jsonc`).
 *
 * For those entries:
 * - The Work card and any detail link must point at the LP path.
 * - Navigation must be a full document request (a plain `<a>`, not
 *   `next/link`) so the request reaches Cloudflare's edge route and is
 *   resolved by the LP Worker — a `next/link` soft navigation would be
 *   handled by the Next.js router and hit the `/work/[slug]` route instead.
 */

type LandingPagePaths = {
  /** English LP path (relative to the site origin). */
  en: string
  /** Japanese LP path (relative to the site origin). */
  ja: string
}

/**
 * Map of microCMS project content IDs to their dedicated landing page paths.
 * The key MUST match the microCMS "content ID" of the project record so that
 * the card, sitemap and detail route all resolve to the same LP.
 */
export const PROJECT_LANDING_PAGES: Record<string, LandingPagePaths> = {
  // wordpress-skills: an Astro LP mounted at `hidetaka.dev/work/wordpress-skills`
  // (and `/work/wordpress-skills/ja`) by a separate Cloudflare Worker.
  'wordpress-skills': {
    en: '/work/wordpress-skills',
    ja: '/work/wordpress-skills/ja',
  },
}

/**
 * Whether a project is backed by a dedicated landing page.
 */
export function isProjectLandingPage(projectId: string): boolean {
  return projectId in PROJECT_LANDING_PAGES
}

/**
 * Resolve the link target for a Work project card / detail.
 * Returns the dedicated LP path when one exists, otherwise the internal
 * Next.js `/work/[slug]` detail route.
 */
export function getProjectHref(projectId: string, lang: string): string {
  const lp = PROJECT_LANDING_PAGES[projectId]
  const isJapanese = lang.startsWith('ja')
  if (lp) {
    return isJapanese ? lp.ja : lp.en
  }
  return isJapanese ? `/ja/work/${projectId}` : `/work/${projectId}`
}
