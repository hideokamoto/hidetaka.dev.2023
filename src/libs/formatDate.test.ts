import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('should format date string to US locale', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024')
  })

  it('should format date at start of year', () => {
    expect(formatDate('2024-01-01')).toBe('January 1, 2024')
  })

  it('should format date at end of year', () => {
    expect(formatDate('2024-12-31')).toBe('December 31, 2024')
  })

  it('should handle leap year date', () => {
    expect(formatDate('2024-02-29')).toBe('February 29, 2024')
  })

  it('should format mid-year date', () => {
    expect(formatDate('2024-06-15')).toBe('June 15, 2024')
  })

  it('should use UTC timezone consistently', () => {
    const result = formatDate('2024-12-31')
    expect(result).toBe('December 31, 2024')
  })

  it('should handle different years correctly', () => {
    expect(formatDate('2023-03-20')).toBe('March 20, 2023')
    expect(formatDate('2025-07-04')).toBe('July 4, 2025')
  })
})
