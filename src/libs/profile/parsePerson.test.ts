import { describe, expect, it } from 'vitest'
import { classifySocialUrl, parsePersonJsonLd } from './parsePerson'

/**
 * A realistic document, matching what `@profile-ssot/projection`'s `toJsonLd` emits:
 * fixed key order, absent fields omitted entirely (never `undefined`), `sameAs` in
 * source order with `basics.url` last.
 */
const VALID_PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://example.cloudfront.net/p/hidetaka/ja/',
  name: '岡本 秀高',
  inLanguage: 'ja',
  jobTitle: 'シニアフィールドエンジニア',
  description:
    'CircleCI（JAPAC）のシニアフィールドエンジニア。元 Stripe デベロッパーアドボケイト。',
  url: 'https://example.cloudfront.net/p/hidetaka/ja/',
  image: 'https://gravatar.com/avatar/abc123',
  sameAs: [
    'https://github.com/hideokamoto',
    'https://twitter.com/hidetaka_dev',
    'https://www.linkedin.com/in/hideokamoto/',
    'https://wp-kyoto.net/',
    'https://hidetaka.dev',
  ],
  worksFor: { '@type': 'Organization', name: 'CircleCI' },
  knowsAbout: ['TypeScript', 'AWS', 'Stripe'],
  award: ['AWS Samurai 2017', 'Alexa Champion'],
}

describe('classifySocialUrl', () => {
  it('recognises the networks the site renders icons for', () => {
    expect(classifySocialUrl('https://github.com/hideokamoto')).toBe('github')
    expect(classifySocialUrl('https://twitter.com/hidetaka_dev')).toBe('twitter')
    expect(classifySocialUrl('https://x.com/hidetaka_dev')).toBe('twitter')
    expect(classifySocialUrl('https://www.linkedin.com/in/hideokamoto/')).toBe('linkedin')
  })

  it('falls back to "other" for unrecognised hosts', () => {
    expect(classifySocialUrl('https://wp-kyoto.net/')).toBe('other')
    expect(classifySocialUrl('https://hidetaka.dev')).toBe('other')
  })

  it('matches the registrable domain, not a suffix — a lookalike host is not the real one', () => {
    // `endsWith('github.com')` would wrongly accept these.
    expect(classifySocialUrl('https://evil-github.com/hideokamoto')).toBe('other')
    expect(classifySocialUrl('https://notlinkedin.com/in/x')).toBe('other')
  })

  it('returns "other" for a string that is not a URL at all', () => {
    expect(classifySocialUrl('not a url')).toBe('other')
    expect(classifySocialUrl('')).toBe('other')
  })
})

describe('parsePersonJsonLd', () => {
  it('maps a complete Person document onto the site-facing shape', () => {
    const profile = parsePersonJsonLd(VALID_PERSON)

    expect(profile).not.toBeNull()
    expect(profile?.name).toBe('岡本 秀高')
    expect(profile?.jobTitle).toBe('シニアフィールドエンジニア')
    expect(profile?.description).toContain('CircleCI')
    expect(profile?.image).toBe('https://gravatar.com/avatar/abc123')
    expect(profile?.worksFor).toEqual({ name: 'CircleCI' })
    expect(profile?.knowsAbout).toEqual(['TypeScript', 'AWS', 'Stripe'])
    expect(profile?.awards).toEqual(['AWS Samurai 2017', 'Alexa Champion'])
  })

  it('preserves sameAs order and classifies each entry', () => {
    const profile = parsePersonJsonLd(VALID_PERSON)

    expect(profile?.sameAs).toEqual(VALID_PERSON.sameAs)
    expect(profile?.social).toEqual([
      { network: 'github', url: 'https://github.com/hideokamoto' },
      { network: 'twitter', url: 'https://twitter.com/hidetaka_dev' },
      { network: 'linkedin', url: 'https://www.linkedin.com/in/hideokamoto/' },
      { network: 'other', url: 'https://wp-kyoto.net/' },
      { network: 'other', url: 'https://hidetaka.dev' },
    ])
  })

  it('tolerates a document carrying only the required name', () => {
    const profile = parsePersonJsonLd({ '@type': 'Person', name: 'Hidetaka Okamoto' })

    expect(profile).toEqual({
      name: 'Hidetaka Okamoto',
      jobTitle: undefined,
      description: undefined,
      image: undefined,
      url: undefined,
      sameAs: [],
      social: [],
      worksFor: undefined,
      knowsAbout: [],
      awards: [],
    })
  })

  it('drops non-string entries inside the array fields rather than rendering them', () => {
    const profile = parsePersonJsonLd({
      '@type': 'Person',
      name: 'Hidetaka Okamoto',
      sameAs: ['https://github.com/hideokamoto', 42, null, { url: 'nope' }],
      knowsAbout: ['AWS', 7],
      award: [{ title: 'x' }, 'Alexa Champion'],
    })

    expect(profile?.sameAs).toEqual(['https://github.com/hideokamoto'])
    expect(profile?.knowsAbout).toEqual(['AWS'])
    expect(profile?.awards).toEqual(['Alexa Champion'])
  })

  it('ignores a worksFor that carries no usable name', () => {
    expect(parsePersonJsonLd({ ...VALID_PERSON, worksFor: {} })?.worksFor).toBeUndefined()
    expect(parsePersonJsonLd({ ...VALID_PERSON, worksFor: 'CircleCI' })?.worksFor).toBeUndefined()
  })

  it('returns null when the document is not a usable Person', () => {
    // Fail closed at the boundary: the caller substitutes its own fallback rather than
    // rendering a card with an empty name.
    expect(parsePersonJsonLd(null)).toBeNull()
    expect(parsePersonJsonLd(undefined)).toBeNull()
    expect(parsePersonJsonLd('a string')).toBeNull()
    expect(parsePersonJsonLd([])).toBeNull()
    expect(parsePersonJsonLd({})).toBeNull()
    expect(parsePersonJsonLd({ '@type': 'Person' })).toBeNull()
    expect(parsePersonJsonLd({ '@type': 'Person', name: '' })).toBeNull()
    expect(parsePersonJsonLd({ '@type': 'Person', name: '   ' })).toBeNull()
    expect(parsePersonJsonLd({ '@type': 'Person', name: 123 })).toBeNull()
  })

  it('rejects a document whose @type is not Person', () => {
    // The same host also serves BlogPosting/Organization documents elsewhere; a wrong
    // URL should fail closed rather than render whatever happens to have a `name`.
    expect(parsePersonJsonLd({ '@type': 'Organization', name: 'CircleCI' })).toBeNull()
  })
})
