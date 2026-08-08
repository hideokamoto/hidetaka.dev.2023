import { cache } from 'react'
import { profileFallback } from './fallback'
import { parsePersonJsonLd } from './parsePerson'
import type { Profile, ProfileLang } from './types'

/**
 * Isomorphic loader for the profile served by profile-as-a-service.
 *
 * The artifact is public, unauthenticated, credential-free static JSON behind CloudFront
 * with `Access-Control-Allow-Origin: *`, so the *same* function works in both places it is
 * needed: a server component building the Person JSON-LD, and a client component rendering
 * the visible profile card. One module, two call sites — no duplicated wire format.
 *
 * It never throws and never returns a partial profile. Every failure path — unconfigured,
 * unreachable, non-2xx, malformed body, wrong document type — resolves to the static
 * fallback so a CDN hiccup cannot blank out a profile card or break a page render.
 */

/** How long a server-side fetch may serve a cached copy. Ignored by browsers. */
const REVALIDATE_SECONDS = 3600

/**
 * Hard ceiling on the request itself.
 *
 * Without this, an upstream that accepts the connection but never responds (as opposed to
 * cleanly failing) never reaches the `catch` below — the `await fetch` just hangs. Because
 * this loader runs unconditionally on every page render (`layout.tsx`) and again on the About
 * page, a stalled upstream would stall the entire site's SSR, not just the profile card.
 */
const FETCH_TIMEOUT_MS = 5000

/** Compose the language-scoped artifact URL, tolerating a trailing slash on the base. */
export function buildProfileUrl(baseUrl: string, id: string, lang: ProfileLang): string {
  return `${baseUrl.replace(/\/+$/, '')}/p/${id}/${lang}/profile.jsonld`
}

/**
 * Read at call time rather than at module scope: `vi.stubEnv` in tests, and more importantly
 * so an unset variable is re-evaluated per call instead of being frozen at import.
 */
function readConfig(): { baseUrl: string; id: string } | null {
  const baseUrl = process.env.NEXT_PUBLIC_PROFILE_BASE_URL
  if (!baseUrl) return null

  return { baseUrl, id: process.env.NEXT_PUBLIC_PROFILE_ID || 'hidetaka' }
}

export async function loadProfile(lang: ProfileLang): Promise<Profile> {
  const config = readConfig()
  // Unconfigured is a normal state, not an error: the integration stays inert (and silent)
  // until the service URL is set, so local dev and previews need no extra setup.
  if (!config) return profileFallback(lang)

  const url = buildProfileUrl(config.baseUrl, config.id, lang)

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) {
      console.warn(`[profile] ${response.status} from ${url}; using fallback profile`)
      return profileFallback(lang)
    }

    const profile = parsePersonJsonLd(await response.json())
    if (!profile) {
      console.warn(`[profile] unusable Person document at ${url}; using fallback profile`)
      return profileFallback(lang)
    }

    return profile
  } catch (error) {
    console.warn(`[profile] failed to load ${url}; using fallback profile`, error)
    return profileFallback(lang)
  }
}

/**
 * Server-only dedup of {@link loadProfile}: multiple server components asking for the same
 * language within one request (root layout's Person JSON-LD, `AboutPageContent`'s bio) share
 * a single fetch instead of each re-fetching and re-parsing the same document.
 *
 * `React.cache()` is scoped to server rendering — memoizing forever with no invalidation is
 * exactly wrong for `loadProfile`'s other call site (`ProfileCardLoader`, client-side), so
 * that one keeps calling the plain, uncached `loadProfile`.
 */
export const loadProfileForRequest = cache(loadProfile)
