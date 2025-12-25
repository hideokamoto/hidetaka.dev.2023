import fc from 'fast-check'
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

  describe('property-based tests', () => {
    it('should preserve array length', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record<MicroCMSEventsRecord>({
              id: fc.string({ minLength: 1 }),
              date: fc
                .date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') })
                .map((d) => {
                  const year = d.getUTCFullYear()
                  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
                  const day = String(d.getUTCDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                }),
              title: fc.string({ minLength: 1 }),
              url: fc.string({ minLength: 1 }),
              place: fc.string({ minLength: 1 }),
              createdAt: fc.string(),
              updatedAt: fc.string(),
              publishedAt: fc.string(),
            }),
            { minLength: 0, maxLength: 100 },
          ),
          (events) => {
            const sorted = sortByEventDate(events)
            expect(sorted.length).toBe(events.length)
          },
        ),
      )
    })

    it('should sort events in descending order by date', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record<MicroCMSEventsRecord>({
              id: fc.string({ minLength: 1 }),
              date: fc
                .date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') })
                .map((d) => {
                  const year = d.getUTCFullYear()
                  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
                  const day = String(d.getUTCDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                }),
              title: fc.string({ minLength: 1 }),
              url: fc.string({ minLength: 1 }),
              place: fc.string({ minLength: 1 }),
              createdAt: fc.string(),
              updatedAt: fc.string(),
              publishedAt: fc.string(),
            }),
            { minLength: 2, maxLength: 100 },
          ),
          (events) => {
            const sorted = sortByEventDate(events)
            for (let i = 0; i < sorted.length - 1; i++) {
              const currentDate = new Date(sorted[i].date).getTime()
              const nextDate = new Date(sorted[i + 1].date).getTime()
              // 有効な日付であることを確認してから比較
              if (!Number.isNaN(currentDate) && !Number.isNaN(nextDate)) {
                expect(currentDate).toBeGreaterThanOrEqual(nextDate)
              }
            }
          },
        ),
      )
    })

    it('should handle empty array', () => {
      fc.assert(
        fc.property(fc.constant([]), (events) => {
          const sorted = sortByEventDate(events)
          expect(sorted).toEqual([])
        }),
      )
    })

    it('should preserve all event IDs (no duplicates or missing)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record<MicroCMSEventsRecord>({
              id: fc.string({ minLength: 1 }),
              date: fc
                .date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') })
                .map((d) => {
                  const year = d.getUTCFullYear()
                  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
                  const day = String(d.getUTCDate()).padStart(2, '0')
                  return `${year}-${month}-${day}`
                }),
              title: fc.string({ minLength: 1 }),
              url: fc.string({ minLength: 1 }),
              place: fc.string({ minLength: 1 }),
              createdAt: fc.string(),
              updatedAt: fc.string(),
              publishedAt: fc.string(),
            }),
            { minLength: 0, maxLength: 50 },
          ),
          (events) => {
            const sorted = sortByEventDate(events)
            const originalIds = new Set(events.map((e) => e.id))
            const sortedIds = new Set(sorted.map((e) => e.id))
            expect(sortedIds.size).toBe(originalIds.size)
            for (const id of sortedIds) {
              expect(originalIds.has(id)).toBe(true)
            }
          },
        ),
      )
    })

    it('should handle events with same date', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }).map((d) => {
            const year = d.getUTCFullYear()
            const month = String(d.getUTCMonth() + 1).padStart(2, '0')
            const day = String(d.getUTCDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }),
          fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
          (dateStr, ids) => {
            const events: MicroCMSEventsRecord[] = ids.map((id) => createMockEvent(id, dateStr))
            const sorted = sortByEventDate(events)
            expect(sorted.length).toBe(events.length)
            // すべてのイベントが同じ日付を持つことを確認
            for (const event of sorted) {
              expect(event.date).toBe(dateStr)
            }
          },
        ),
      )
    })
  })
})
