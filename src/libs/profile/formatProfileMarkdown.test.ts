import { describe, expect, it } from 'vitest'
import { formatProfileAsMarkdown } from './formatProfileMarkdown'
import type { Profile } from './types'

const baseProfile: Profile = {
  name: 'Hidetaka Okamoto',
  jobTitle: 'Senior Field Engineer',
  description: 'Builds and teaches around payments, serverless, and developer experience.',
  image: '/images/profile.jpg',
  url: 'https://hidetaka.dev',
  sameAs: ['https://github.com/hideokamoto', 'https://twitter.com/hidetaka_dev'],
  social: [
    { network: 'github', url: 'https://github.com/hideokamoto' },
    { network: 'twitter', url: 'https://twitter.com/hidetaka_dev' },
  ],
  worksFor: { name: 'CircleCI', url: 'https://circleci.com/' },
  knowsAbout: ['Stripe', 'AWS Serverless'],
  awards: ['AWS Samurai 2017'],
}

describe('formatProfileAsMarkdown', () => {
  it('renders name, role, bio, links, knowsAbout, and awards for English', () => {
    const markdown = formatProfileAsMarkdown(baseProfile, 'en')

    expect(markdown).toContain('# Hidetaka Okamoto')
    expect(markdown).toContain('Senior Field Engineer at CircleCI')
    expect(markdown).toContain('Builds and teaches around payments')
    expect(markdown).toContain('## Social Links')
    expect(markdown).toContain('- https://github.com/hideokamoto')
    expect(markdown).toContain('## Knows About')
    expect(markdown).toContain('Stripe, AWS Serverless')
    expect(markdown).toContain('## Awards')
    expect(markdown).toContain('- AWS Samurai 2017')
    expect(markdown).toContain('Canonical page: https://hidetaka.dev/about')
  })

  it('renders Japanese section headings and canonical path for ja', () => {
    const markdown = formatProfileAsMarkdown({ ...baseProfile, name: '岡本 秀高' }, 'ja')

    expect(markdown).toContain('# 岡本 秀高')
    expect(markdown).toContain('## ソーシャルリンク')
    expect(markdown).toContain('## 専門領域')
    expect(markdown).toContain('## 受賞歴')
    expect(markdown).toContain('Canonical page: https://hidetaka.dev/ja/about')
  })

  it('omits sections whose data is absent rather than printing an empty heading', () => {
    const minimal: Profile = {
      name: 'Someone',
      sameAs: [],
      social: [],
      knowsAbout: [],
      awards: [],
    }

    const markdown = formatProfileAsMarkdown(minimal, 'en')

    expect(markdown).not.toContain('## Social Links')
    expect(markdown).not.toContain('## Knows About')
    expect(markdown).not.toContain('## Awards')
    expect(markdown).toContain('# Someone')
  })
})
