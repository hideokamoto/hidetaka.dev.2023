import { SITE_CONFIG } from '@/config'
import type { Profile, ProfileLang } from './types'

/**
 * Renders a {@link Profile} as plain Markdown for `/about.md` and `/ja/about.md`.
 *
 * This exists so AI agents fetching the site have a canonical, structured-but-plain-text
 * landing point for "who is this person and where do I find their social links" — the same
 * question the Person JSON-LD in `<head>` answers for search engines, but JSON-LD is
 * typically stripped when a page is converted to Markdown for an LLM, so it never reaches
 * agent-facing tooling. Kept as a pure function (no fetch) so it's testable without a network.
 */
/** Role line: "{jobTitle} at {employer}", skipping either half when absent. */
function formatRoleLine(profile: Profile, isJapanese: boolean): string | undefined {
  const roleParts = [profile.jobTitle, profile.worksFor?.name].filter(Boolean)
  if (roleParts.length === 0) return undefined
  return roleParts.join(isJapanese ? ' / ' : ' at ')
}

/** A `## heading` followed by a bullet list, or `undefined` when `items` is empty. */
function formatBulletSection(heading: string, items: readonly string[]): string[] | undefined {
  if (items.length === 0) return undefined
  return [heading, ...items.map((item) => `- ${item}`), '']
}

export function formatProfileAsMarkdown(profile: Profile, lang: ProfileLang): string {
  const isJapanese = lang === 'ja'
  const lines: string[] = [`# ${profile.name}`, '']

  const roleLine = formatRoleLine(profile, isJapanese)
  if (roleLine) lines.push(roleLine, '')

  if (profile.description) lines.push(profile.description, '')

  const socialSection = formatBulletSection(
    isJapanese ? '## ソーシャルリンク' : '## Social Links',
    profile.social.map((link) => link.url),
  )
  if (socialSection) lines.push(...socialSection)

  if (profile.knowsAbout.length > 0) {
    lines.push(isJapanese ? '## 専門領域' : '## Knows About', profile.knowsAbout.join(', '), '')
  }

  const awardsSection = formatBulletSection(isJapanese ? '## 受賞歴' : '## Awards', profile.awards)
  if (awardsSection) lines.push(...awardsSection)

  const canonicalPath = isJapanese ? '/ja/about' : '/about'
  lines.push(`Canonical page: ${SITE_CONFIG.url}${canonicalPath}`)

  return `${lines.join('\n')}\n`
}
