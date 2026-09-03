import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MicroCMSProjectStatus } from './microCMS/types'
import {
  getMicroCMSProjectStatus,
  getStatusBadgeVariant,
  getStatusFromLastUpdate,
  getStatusLabel,
  isActiveStatus,
} from './projectStatus.utils'

describe('projectStatus.utils', () => {
  describe('isActiveStatus', () => {
    it('should return true for active status', () => {
      expect(isActiveStatus('active')).toBe(true)
    })

    it('should return false for deprecated status', () => {
      expect(isActiveStatus('deprecated')).toBe(false)
    })

    it('should return false for archived status', () => {
      expect(isActiveStatus('archived')).toBe(false)
    })

    it('should return false for completed status', () => {
      expect(isActiveStatus('completed')).toBe(false)
    })
  })

  describe('getStatusFromLastUpdate', () => {
    let now: Date

    beforeEach(() => {
      // Mock current date to 2024-08-15 for consistent testing
      now = new Date('2024-08-15T12:00:00Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return active for recent updates (within threshold)', () => {
      // 3 months ago (within 6-month threshold)
      const recentDate = new Date('2024-05-15T12:00:00Z')
      expect(getStatusFromLastUpdate(recentDate)).toBe('active')
    })

    it('should return active for updates at threshold boundary', () => {
      // Exactly 6 months ago
      const thresholdDate = new Date('2024-02-15T12:00:00Z')
      expect(getStatusFromLastUpdate(thresholdDate)).toBe('active')
    })

    it('should return deprecated for updates older than threshold', () => {
      // 7 months ago (beyond 6-month threshold)
      const oldDate = new Date('2024-01-15T12:00:00Z')
      expect(getStatusFromLastUpdate(oldDate)).toBe('deprecated')
    })

    it('should return active for very recent updates (today)', () => {
      expect(getStatusFromLastUpdate(now)).toBe('active')
    })

    it('should handle string dates', () => {
      const recentDate = '2024-05-15T12:00:00Z'
      expect(getStatusFromLastUpdate(recentDate)).toBe('active')
    })

    it('should handle end-of-month dates correctly', () => {
      // Set current date to end of month
      const endOfMonth = new Date('2024-08-31T12:00:00Z')
      vi.setSystemTime(endOfMonth)

      // 6 months before Aug 31 is Feb 29 (leap year), or Feb 28/29 depending on year
      // Should not throw and should calculate correctly
      const sixMonthsAgo = new Date('2024-02-29T12:00:00Z')
      expect(getStatusFromLastUpdate(sixMonthsAgo)).toBe('active')

      // One day older than threshold should be deprecated
      const olderThanThreshold = new Date('2024-02-28T12:00:00Z')
      expect(getStatusFromLastUpdate(olderThanThreshold)).toBe('deprecated')
    })

    it('should handle year boundary correctly', () => {
      // Set current date to Jan 15, 2024
      const jan15 = new Date('2024-01-15T12:00:00Z')
      vi.setSystemTime(jan15)

      // 6 months before should be July 15, 2023
      const sixMonthsAgo = new Date('2023-07-15T12:00:00Z')
      expect(getStatusFromLastUpdate(sixMonthsAgo)).toBe('active')

      // 7 months before should be deprecated
      const sevenMonthsAgo = new Date('2023-06-15T12:00:00Z')
      expect(getStatusFromLastUpdate(sevenMonthsAgo)).toBe('deprecated')
    })

    it('should preserve day when subtracting months (not end-of-month)', () => {
      // Aug 15 minus 6 months = Feb 15
      const date = new Date('2024-02-15T12:00:00Z')
      expect(getStatusFromLastUpdate(date)).toBe('active')
    })

    it('should return active when last update equals threshold date exactly', () => {
      // Threshold uses local midnight on the boundary day; equality must count as active.
      const thresholdDate = new Date(2024, 1, 15)
      expect(getStatusFromLastUpdate(thresholdDate)).toBe('active')
    })
  })

  describe('getStatusBadgeVariant', () => {
    it('should return green for active status', () => {
      expect(getStatusBadgeVariant('active')).toBe('green')
    })

    it('should return gray for non-active statuses', () => {
      expect(getStatusBadgeVariant('deprecated')).toBe('gray')
      expect(getStatusBadgeVariant('archived')).toBe('gray')
      expect(getStatusBadgeVariant('completed')).toBe('gray')
    })
  })

  describe('getStatusLabel', () => {
    it('should return localized labels for known statuses', () => {
      expect(getStatusLabel('active', 'ja')).toBe('アクティブ')
      expect(getStatusLabel('active', 'en')).toBe('Active')
      expect(getStatusLabel('deprecated', 'ja')).toBe('非推奨')
      expect(getStatusLabel('deprecated', 'en')).toBe('Deprecated')
      expect(getStatusLabel('archived', 'ja')).toBe('アーカイブ')
      expect(getStatusLabel('completed', 'en')).toBe('Completed')
    })

    it('should default to Active labels for invalid status values', () => {
      expect(getStatusLabel('', 'en')).toBe('Active')
      expect(getStatusLabel('', 'ja')).toBe('アクティブ')
    })

    it('should capitalize unknown status strings', () => {
      expect(getStatusLabel('beta', 'en')).toBe('Beta')
    })
  })

  describe('getMicroCMSProjectStatus', () => {
    it('should return the provided status', () => {
      const status: MicroCMSProjectStatus = 'active'
      expect(getMicroCMSProjectStatus(status)).toBe('active')
    })

    it('should return deprecated for deprecated status', () => {
      expect(getMicroCMSProjectStatus('deprecated')).toBe('deprecated')
    })

    it('should return archived for archived status', () => {
      expect(getMicroCMSProjectStatus('archived')).toBe('archived')
    })

    it('should return completed for completed status', () => {
      expect(getMicroCMSProjectStatus('completed')).toBe('completed')
    })

    it('should default to active when status is undefined', () => {
      expect(getMicroCMSProjectStatus(undefined)).toBe('active')
    })

    it('should default to active when status is falsy', () => {
      // Test with undefined (falsy value)
      expect(getMicroCMSProjectStatus(undefined)).toBe('active')
    })
  })
})
