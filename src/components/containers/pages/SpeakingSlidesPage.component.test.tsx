import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SpeakingSlidesPage from '@/components/containers/pages/SpeakingSlidesPage'
import type { SlideEntry } from '@/libs/speaking/slides'

const slide = (over: Partial<SlideEntry>): SlideEntry => ({
  id: 'docswell:x',
  title: 'Slide',
  url: 'https://www.docswell.com/s/hideokamoto/x',
  publishedAt: '2026-09-20T10:00:00.000Z',
  excerpt: '',
  sourceName: 'Docswell',
  year: '2026',
  ...over,
})

const groups = [
  {
    year: '2026',
    items: [
      slide({ id: 'docswell:new', title: 'Amplify Hosting の CI/CD 入門' }),
      slide({ id: 'docswell:mid', title: 'Serverless WordPress' }),
    ],
  },
  {
    year: '2024',
    items: [slide({ id: 'docswell:old', title: 'Old Talk Deck', year: '2024' })],
  },
]

describe('SpeakingSlidesPage', () => {
  it('renders year headings and card titles', () => {
    render(<SpeakingSlidesPage lang="en" groups={groups} total={3} />)
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('Amplify Hosting の CI/CD 入門')).toBeInTheDocument()
    expect(screen.getByText('Serverless WordPress')).toBeInTheDocument()
    expect(screen.getByText('Old Talk Deck')).toBeInTheDocument()
  })

  it('renders English labels', () => {
    render(<SpeakingSlidesPage lang="en" groups={groups} total={3} />)
    expect(screen.getByText('Slides')).toBeInTheDocument()
    expect(screen.getAllByText('View slides')).toHaveLength(3)
    expect(screen.getByText('← Speaking')).toBeInTheDocument()
  })

  it('renders Japanese labels', () => {
    render(<SpeakingSlidesPage lang="ja" groups={groups} total={3} />)
    expect(screen.getByText('スライド')).toBeInTheDocument()
    expect(screen.getAllByText('スライドを見る')).toHaveLength(3)
    expect(screen.getByText('← 登壇・講演')).toBeInTheDocument()
  })

  it('renders the empty state when there are no groups', () => {
    render(<SpeakingSlidesPage lang="en" groups={[]} total={0} />)
    expect(screen.getByText('No slides found.')).toBeInTheDocument()
  })

  it('renders the Japanese empty state', () => {
    render(<SpeakingSlidesPage lang="ja" groups={[]} total={0} />)
    expect(screen.getByText('スライドが見つかりませんでした。')).toBeInTheDocument()
  })
})
