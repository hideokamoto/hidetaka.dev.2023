import { SITE_CONFIG } from '@/config'

/**
 * Builds the content served at `/llms.txt`.
 *
 * This follows the (unofficial, community-driven — not a web standard) llms.txt convention:
 * an H1 title, a blockquote summary, then `##` sections of Markdown link lists. Its purpose
 * is narrow: point an AI agent that already knows to check `/llms.txt` at the *canonical*
 * machine-readable sources for this person's profile and social links, rather than letting
 * it re-derive them from rendered HTML (where the Person JSON-LD in `<head>` is typically
 * stripped by HTML-to-Markdown conversion before an agent ever sees it).
 *
 * Kept as a pure function of `SITE_CONFIG` (no fetch) so it's testable without a network and
 * stays in sync if social links ever change.
 */
export function buildLlmsTxt(): string {
  const { url, author, social, wpKyoto } = SITE_CONFIG

  const lines: string[] = [
    `# ${author.name}`,
    '',
    `> Personal portfolio and developer blog of ${author.name} (${author.nameJa}), ` +
      `${author.jobTitle} at ${author.worksFor.name}. This file points AI agents and LLMs ` +
      "to this site's canonical, machine-readable sources instead of re-deriving them from " +
      'rendered HTML.',
    '',
    '## Profile',
    `- [About, in Markdown](${url}/about.md): Canonical bio, job title, employer, and social links.`,
    `- [About, Japanese Markdown](${url}/ja/about.md): 日本語版プロフィール。`,
    `- [About page](${url}/about): Same content as HTML; also carries Schema.org Person JSON-LD.`,
    '',
    '## Social',
    `- [GitHub](${social.github.url})`,
    `- [Twitter/X](${social.twitter.url})`,
    `- [LinkedIn](${social.linkedin.url})`,
    `- [${wpKyoto.label}](${wpKyoto.url}): Long-running personal tech blog (10+ years).`,
    '',
    '## Content',
    `- [Blog](${url}/blog): Aggregated posts from Dev.to, Qiita, Zenn, and WordPress. ` +
      'Individual posts are also available as Markdown by appending `.md` to their URL, ' +
      'or by requesting them with `Accept: text/markdown`.',
    `- [Writing](${url}/writing): Articles and dev notes.`,
    `- [Work](${url}/work): OSS projects, books, and community activities.`,
    `- [Speaking](${url}/speaking): Conference and meetup talks.`,
    '',
    '## Optional',
    `- [Sitemap](${url}/sitemap.xml)`,
  ]

  return `${lines.join('\n')}\n`
}
