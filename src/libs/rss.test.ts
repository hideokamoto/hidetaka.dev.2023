import { describe, expect, it } from 'vitest'
import { escapeXml, generateRssXml, type RssChannel, toRfc822 } from './rss'

describe('escapeXml', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml('a & b < c > d "e" \'f\'')).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;',
    )
  })

  it('returns plain text unchanged', () => {
    expect(escapeXml('Hello World')).toBe('Hello World')
  })

  it('returns an empty string for null or undefined', () => {
    expect(escapeXml(null)).toBe('')
    expect(escapeXml(undefined)).toBe('')
  })
})

describe('toRfc822', () => {
  it('converts ISO date to RFC822', () => {
    expect(toRfc822('2024-01-15T00:00:00.000Z')).toBe('Mon, 15 Jan 2024 00:00:00 GMT')
  })

  it('returns null for invalid date', () => {
    expect(toRfc822('not-a-date')).toBeNull()
  })

  it('returns null for falsy input instead of the 1970 epoch', () => {
    expect(toRfc822(null)).toBeNull()
    expect(toRfc822(undefined)).toBeNull()
    expect(toRfc822('')).toBeNull()
  })
})

describe('generateRssXml', () => {
  const channel: RssChannel = {
    title: 'Test Feed',
    link: 'https://hidetaka.dev/writing',
    description: 'Latest writing',
    feedUrl: 'https://hidetaka.dev/projects/rss.xml',
    items: [
      {
        title: 'First & Post',
        link: 'https://hidetaka.dev/writing/dev-notes/first',
        description: 'Hello <world>',
        pubDate: '2024-01-15T00:00:00.000Z',
      },
    ],
  }

  it('produces a valid RSS root element', () => {
    const xml = generateRssXml(channel)
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<channel>')
  })

  it('escapes special characters in items', () => {
    const xml = generateRssXml(channel)
    expect(xml).toContain('<title>First &amp; Post</title>')
    expect(xml).toContain('<description>Hello &lt;world&gt;</description>')
  })

  it('includes a self-referencing atom link', () => {
    const xml = generateRssXml(channel)
    expect(xml).toContain('https://hidetaka.dev/projects/rss.xml')
    expect(xml).toContain('rel="self"')
  })

  it('formats pubDate as RFC822', () => {
    const xml = generateRssXml(channel)
    expect(xml).toContain('<pubDate>Mon, 15 Jan 2024 00:00:00 GMT</pubDate>')
  })

  it('omits pubDate when the date is invalid', () => {
    const xml = generateRssXml({
      ...channel,
      items: [{ ...channel.items[0], pubDate: 'invalid' }],
    })
    expect(xml).not.toContain('<pubDate>')
  })
})
