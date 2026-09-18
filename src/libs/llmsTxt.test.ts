import { describe, expect, it } from 'vitest'
import { SITE_CONFIG } from '@/config'
import { buildLlmsTxt } from './llmsTxt'

describe('buildLlmsTxt', () => {
  it('starts with an H1 title followed by a blockquote summary', () => {
    const txt = buildLlmsTxt()
    const lines = txt.split('\n')

    expect(lines[0]).toBe(`# ${SITE_CONFIG.author.name}`)
    expect(lines[1]).toBe('')
    expect(lines[2].startsWith('> ')).toBe(true)
  })

  it('links to the about.md endpoints and the social profiles from config', () => {
    const txt = buildLlmsTxt()

    expect(txt).toContain(`${SITE_CONFIG.url}/about.md`)
    expect(txt).toContain(`${SITE_CONFIG.url}/ja/about.md`)
    expect(txt).toContain(SITE_CONFIG.social.github.url)
    expect(txt).toContain(SITE_CONFIG.social.twitter.url)
    expect(txt).toContain(SITE_CONFIG.social.linkedin.url)
    expect(txt).toContain(SITE_CONFIG.wpKyoto.url)
  })

  it('ends with a trailing newline', () => {
    expect(buildLlmsTxt().endsWith('\n')).toBe(true)
  })
})
