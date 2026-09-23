import { describe, expect, it } from 'vitest'
import type { SlidesGold } from '@/libs/contentLake/types'
import { cleanSlideTitle, groupSlidesByYear, toSlideEntries } from './slides'

const gold: SlidesGold = {
  target: 'hidetaka.dev',
  updatedAt: '2026-09-23T07:53:39.061Z',
  itemCount: 5,
  items: [
    {
      id: 'docswell:1',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] 古い発表',
      url: 'https://www.docswell.com/s/hideokamoto/old',
      publishedAt: '2024-03-10T10:00:00.000Z',
      excerpt: 'old deck',
      dataSource: { name: 'Docswell', href: 'https://www.docswell.com/', color: '#0073ec' },
    },
    {
      id: 'docswell:2',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] 新しい発表',
      url: 'https://www.docswell.com/s/hideokamoto/new',
      publishedAt: '2026-09-20T10:00:00.000Z',
    },
    {
      id: 'docswell:3',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] 中間の発表',
      url: 'https://www.docswell.com/s/hideokamoto/mid',
      publishedAt: '2025-06-01T10:00:00.000Z',
    },
    {
      id: 'wordpress:4',
      source: 'wordpress',
      type: 'article',
      title: '記事（スライドではない）',
      url: 'https://example.com/article',
      publishedAt: '2026-09-21T10:00:00.000Z',
    },
    {
      id: 'docswell:5',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] 壊れた日付',
      url: 'https://www.docswell.com/s/hideokamoto/broken',
      publishedAt: 'not-a-date',
    },
  ],
}

describe('cleanSlideTitle', () => {
  it('strips the [スライド] prefix', () => {
    expect(cleanSlideTitle('[スライド] Amplify入門')).toBe('Amplify入門')
    expect(cleanSlideTitle('[スライド]Amplify入門')).toBe('Amplify入門')
  })

  it('leaves other titles intact (trimmed)', () => {
    expect(cleanSlideTitle('  Amplify入門  ')).toBe('Amplify入門')
    expect(cleanSlideTitle('Amplify入門')).toBe('Amplify入門')
  })
})

describe('toSlideEntries', () => {
  it('keeps only slide items, sorted newest first', () => {
    const entries = toSlideEntries(gold)
    expect(entries.map((e) => e.id)).toEqual(['docswell:2', 'docswell:3', 'docswell:1'])
  })

  it('drops items with invalid dates', () => {
    const entries = toSlideEntries(gold)
    expect(entries.find((e) => e.id === 'docswell:5')).toBeUndefined()
  })

  it('strips the title prefix and maps fields', () => {
    const entries = toSlideEntries(gold)
    expect(entries[0].title).toBe('新しい発表')
    expect(entries[0].year).toBe('2026')
    expect(entries[2].year).toBe('2024')
  })

  it('defaults excerpt and sourceName when absent', () => {
    const entries = toSlideEntries(gold)
    expect(entries[0].excerpt).toBe('')
    expect(entries[0].sourceName).toBe('Docswell')
    expect(entries[2].excerpt).toBe('old deck')
  })
})

describe('groupSlidesByYear', () => {
  it('groups by UTC year descending, preserving newest-first order', () => {
    const entries = toSlideEntries(gold)
    const groups = groupSlidesByYear(entries)
    expect(groups.map((g) => g.year)).toEqual(['2026', '2025', '2024'])
    expect(groups[0].items.map((e) => e.id)).toEqual(['docswell:2'])
    expect(groups[1].items.map((e) => e.id)).toEqual(['docswell:3'])
  })

  it('returns an empty array for no entries', () => {
    expect(groupSlidesByYear([])).toEqual([])
  })
})
