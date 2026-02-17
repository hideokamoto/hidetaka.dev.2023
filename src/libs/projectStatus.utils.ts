/**
 * Project status utility functions
 * Determines active/deprecated status based on last update date
 */

import type { MicroCMSProjectStatus } from './microCMS/types'

/**
 * Status threshold in months (6 months)
 * Projects/packages not updated within this period are considered deprecated
 */
export const STATUS_THRESHOLD_MONTHS = 6

/**
 * Alias for MicroCMSProjectStatus - represents all possible status values across data sources
 */
export type UnifiedProjectStatus = MicroCMSProjectStatus

/**
 * Check if a status is considered active
 * @param status - Status to check
 * @returns True if status is 'active', false otherwise
 */
export function isActiveStatus(status: UnifiedProjectStatus): boolean {
  return status === 'active'
}

/**
 * Determine status from last update date
 * @param lastUpdated - Last update date as string or Date object
 * @returns 'active' if updated within threshold, 'deprecated' otherwise
 */
export function getStatusFromLastUpdate(lastUpdated: string | Date): 'active' | 'deprecated' {
  const lastUpdateDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated
  const now = new Date()

  // Calculate target month/year explicitly to avoid end-of-month rollover issues
  const originalDay = now.getDate()
  let targetMonth = now.getMonth() - STATUS_THRESHOLD_MONTHS
  let targetYear = now.getFullYear()

  // Handle year rollover
  if (targetMonth < 0) {
    targetMonth += 12
    targetYear -= 1
  }

  // Calculate the last day of the target month
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()

  // Create threshold date with the appropriate day (minimum of original day and last day of month)
  const thresholdDate = new Date(
    targetYear,
    targetMonth,
    Math.min(originalDay, lastDayOfTargetMonth),
  )

  return lastUpdateDate >= thresholdDate ? 'active' : 'deprecated'
}

/**
 * Get status for a microCMS project
 * @param status - Optional status field from microCMS
 * @returns Status value, defaulting to 'active' if not specified
 */
export function getMicroCMSProjectStatus(status?: MicroCMSProjectStatus): UnifiedProjectStatus {
  return status || 'active'
}
