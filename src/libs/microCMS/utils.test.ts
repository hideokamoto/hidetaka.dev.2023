import { describe, expect, it } from 'vitest'
import type { MicroCMSEventsRecord } from './types'
import { sortByEventDate } from './utils'

describe('sortByEventDate', () => {
  const createMockEvent = (id: string, date: string): MicroCMSEventsRecord => ({
    id,
    date,
    title: `Event ${id}`,
    url: `https://example.com/${id}`,
    place: 'Test Venue',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    publishedAt: '2024-01-01T00:00:00.000Z',
  })

  it('should sort events by date in descending order (newest first)', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('1', '2024-01-01'),
      createMockEvent('2', '2024-12-31'),
      createMockEvent('3', '2024-06-15'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted[0].id).toBe('2') // 2024-12-31
    expect(sorted[1].id).toBe('3') // 2024-06-15
    expect(sorted[2].id).toBe('1') // 2024-01-01
  })

  it('should handle empty array', () => {
    const result = sortByEventDate([])
    expect(result).toEqual([])
  })

  it('should handle single event', () => {
    const event = createMockEvent('1', '2024-01-01')
    const result = sortByEventDate([event])

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('should sort events across different years', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('1', '2023-12-31'),
      createMockEvent('2', '2025-01-01'),
      createMockEvent('3', '2024-06-15'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted[0].id).toBe('2') // 2025-01-01
    expect(sorted[1].id).toBe('3') // 2024-06-15
    expect(sorted[2].id).toBe('1') // 2023-12-31
  })

  it('should handle events with same date', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('1', '2024-06-15'),
      createMockEvent('2', '2024-06-15'),
      createMockEvent('3', '2024-06-15'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted).toHaveLength(3)
    // When dates are equal, order should remain stable
  })

  it('should handle ISO 8601 date strings', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('1', '2024-01-15T10:00:00.000Z'),
      createMockEvent('2', '2024-12-31T23:59:59.999Z'),
      createMockEvent('3', '2024-06-15T12:30:00.000Z'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted[0].id).toBe('2') // Latest
    expect(sorted[1].id).toBe('3') // Middle
    expect(sorted[2].id).toBe('1') // Earliest
  })

  it('should not mutate original array order when already sorted', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('1', '2024-12-31'),
      createMockEvent('2', '2024-06-15'),
      createMockEvent('3', '2024-01-01'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted[0].id).toBe('1')
    expect(sorted[1].id).toBe('2')
    expect(sorted[2].id).toBe('3')
  })

  it('should handle dates from different months', () => {
    const events: MicroCMSEventsRecord[] = [
      createMockEvent('jan', '2024-01-15'),
      createMockEvent('feb', '2024-02-20'),
      createMockEvent('dec', '2024-12-10'),
      createMockEvent('mar', '2024-03-05'),
    ]

    const sorted = sortByEventDate(events)

    expect(sorted.map((e) => e.id)).toEqual(['dec', 'mar', 'feb', 'jan'])
  })
})
