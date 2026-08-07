import { SITE_CONFIG } from '@/config'
import { classifySocialUrl } from './parsePerson'
import type { Profile, ProfileLang } from './types'

/**
 * Last-known-good static copy of the profile, used whenever profile-as-a-service cannot be
 * reached or returns something unusable.
 *
 * This is a safety net, not a second source of truth: the site must never render an empty
 * profile card because a CDN request failed. Keep it minimal and let the upstream document
 * be the thing that actually gets maintained.
 */

/** Plain-text bio, mirroring what upstream serves as `description`. */
const FALLBACK_DESCRIPTION: Record<ProfileLang, string> = {
  ja: 'CircleCI（JAPAC）のシニアフィールドエンジニア。元 Stripe デベロッパーアドボケイト。AWS Samurai 2017、Alexa Champion。決済・サーバーレス・開発者体験の領域で、つくることと伝えることの両方に取り組んでいます。',
  en: 'Senior Field Engineer at CircleCI (JAPAC), ex-Stripe Developer Advocate. AWS Samurai 2017 and Alexa Champion. Builds and teaches around payments, serverless, and developer experience.',
}

/** Same order upstream emits: profile links first, personal site last. */
const FALLBACK_SAME_AS: readonly string[] = [
  SITE_CONFIG.social.github.url,
  SITE_CONFIG.social.twitter.url,
  SITE_CONFIG.social.linkedin.url,
  SITE_CONFIG.wpKyoto.url,
  SITE_CONFIG.url,
]

export function profileFallback(lang: ProfileLang): Profile {
  const sameAs = [...FALLBACK_SAME_AS]

  return {
    name: lang === 'ja' ? SITE_CONFIG.author.nameJa : SITE_CONFIG.author.name,
    jobTitle: SITE_CONFIG.author.jobTitle,
    description: FALLBACK_DESCRIPTION[lang],
    image: SITE_CONFIG.author.image,
    url: SITE_CONFIG.url,
    sameAs,
    social: sameAs.map((url) => ({ network: classifySocialUrl(url), url })),
    worksFor: {
      name: SITE_CONFIG.author.worksFor.name,
      url: SITE_CONFIG.author.worksFor.url,
    },
    knowsAbout: [],
    awards: [],
  }
}
