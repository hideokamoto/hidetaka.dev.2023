import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AllTimeSummary from '@/components/ui/stats/AllTimeSummary'
import type { WritingAllTime } from '@/libs/stats/writingActivity'

const allTime = (over: Partial<WritingAllTime> = {}): WritingAllTime => ({
  totalArticles: 1500,
  firstPublishedAt: '2014-03-01T00:00:00.000Z',
  lastPublishedAt: '2026-09-20T00:00:00.000Z',
  bySource: [
    {
      key: 'wordpress',
      label: 'WordPress',
      count: 1400,
      sinceYear: 2014,
      isPartialCoverage: false,
    },
    { key: 'zenn', label: 'Zenn', count: 100, sinceYear: 2023, isPartialCoverage: true },
  ],
  yearly: [
    { year: 2026, count: 100, cumulative: 1500 },
    { year: 2014, count: 1400, cumulative: 1400 },
  ],
  ...over,
})

describe('AllTimeSummary', () => {
  it('shows the total, which sources it counts, and a per-source breakdown (ja)', () => {
    render(<AllTimeSummary allTime={allTime()} lang="ja" />)
    expect(screen.getByText('1,500本')).toBeInTheDocument()
    expect(screen.getByText(/WordPress・Zennの記事のみを対象に/)).toBeInTheDocument()
    expect(screen.getByText('（2023年以降）')).toBeInTheDocument()
  })

  it('states the retention start without claiming earlier posts exist (ja)', () => {
    render(<AllTimeSummary allTime={allTime()} lang="ja" />)
    const note = screen.getByText(/Content Lake が保持している記事は、Zennは2023年以降です/)
    expect(note).toBeInTheDocument()
    expect(note.textContent).not.toMatch(/存在します/)
  })

  it('renders the English version', () => {
    render(<AllTimeSummary allTime={allTime()} lang="en" />)
    expect(screen.getAllByText('1,500').length).toBeGreaterThan(0)
    expect(screen.getByText(/Counts articles from WordPress, Zenn only/)).toBeInTheDocument()
    expect(screen.getByText('(from 2023)')).toBeInTheDocument()
  })

  it('omits the coverage note when no source starts later than the others', () => {
    const data = allTime({
      bySource: [
        {
          key: 'wordpress',
          label: 'WordPress',
          count: 1500,
          sinceYear: 2014,
          isPartialCoverage: false,
        },
      ],
    })
    render(<AllTimeSummary allTime={data} lang="ja" />)
    expect(screen.queryByText(/Content Lake が保持している記事は/)).not.toBeInTheDocument()
  })

  it('renders nothing when there are no articles', () => {
    const { container } = render(
      <AllTimeSummary
        allTime={allTime({ totalArticles: 0, bySource: [], yearly: [] })}
        lang="ja"
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
