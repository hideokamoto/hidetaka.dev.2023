import type { Profile, ProfileOrganization, ProfileSocialNetwork } from './types'

/**
 * Boundary parser for the Schema.org `Person` document served by profile-as-a-service.
 *
 * Everything here is pure and synchronous — no fetch, no env — so the mapping is testable
 * without a network. The document crosses a trust boundary (it arrives over HTTP from
 * another system), so nothing is assumed about its shape: unexpected values are dropped
 * and an unusable document yields `null` rather than a half-built profile. Callers
 * substitute their own fallback on `null`; the parser never invents content.
 */

/** Hosts that map onto a social icon the site actually renders. */
const NETWORK_DOMAINS: ReadonlyArray<readonly [ProfileSocialNetwork, readonly string[]]> = [
  ['github', ['github.com']],
  ['twitter', ['twitter.com', 'x.com']],
  ['linkedin', ['linkedin.com']],
]

/**
 * True when `hostname` is `domain` itself or a subdomain of it.
 *
 * The `.`-prefixed suffix check matters: a plain `endsWith('github.com')` would also match
 * `evil-github.com`, letting an unrelated host borrow a trusted network's icon.
 */
function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

/** Classify a `sameAs` URL by its host. Unparseable or unknown hosts are `other`. */
export function classifySocialUrl(url: string): ProfileSocialNetwork {
  let hostname: string
  try {
    hostname = new URL(url).hostname.toLowerCase()
  } catch {
    return 'other'
  }

  for (const [network, domains] of NETWORK_DOMAINS) {
    if (domains.some((domain) => hostMatches(hostname, domain))) return network
  }
  return 'other'
}

/** A non-empty string, or `undefined` — used for every optional scalar field. */
function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

/** Keep only the string entries of a value that should be an array of strings. */
function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
}

/** `worksFor` is a nested Organization node; anything else (or a nameless one) is dropped. */
function parseOrganization(value: unknown): ProfileOrganization | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined

  const record = value as Record<string, unknown>
  const name = optionalString(record.name)
  if (!name) return undefined

  return { name, url: optionalString(record.url) }
}

/**
 * Parse a Schema.org `Person` document into the site-facing {@link Profile}.
 *
 * Returns `null` when the document cannot be used — wrong `@type`, or no usable `name`.
 * `@type` is checked strictly because the same origin serves other document types, and a
 * wrong URL should fail closed instead of rendering whatever happens to carry a `name`.
 */
export function parsePersonJsonLd(raw: unknown): Profile | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null

  const record = raw as Record<string, unknown>
  if (record['@type'] !== 'Person') return null

  const name = optionalString(record.name)
  if (!name) return null

  const sameAs = stringArray(record.sameAs)

  return {
    name,
    jobTitle: optionalString(record.jobTitle),
    description: optionalString(record.description),
    image: optionalString(record.image),
    url: optionalString(record.url),
    sameAs,
    social: sameAs.map((url) => ({ network: classifySocialUrl(url), url })),
    worksFor: parseOrganization(record.worksFor),
    knowsAbout: stringArray(record.knowsAbout),
    // Schema.org spells this `award` (singular); the site-facing name is plural.
    awards: stringArray(record.award),
  }
}
