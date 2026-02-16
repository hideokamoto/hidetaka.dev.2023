/**
 * Project status determination utilities
 * Handles status logic for projects across multiple data sources (microCMS, npm, WordPress)
 */

// Threshold for determining if a project is deprecated (in months)
export const STATUS_THRESHOLD_MONTHS = 6

export type UnifiedProjectStatus = 'active' | 'deprecated' | 'archived' | 'completed'

/**
 * Determine project status based on last update date
 * Projects not updated within STATUS_THRESHOLD_MONTHS are considered deprecated
 * @param lastUpdated - ISO string or Date object of last update
 * @returns Status: 'active' if recently updated, 'deprecated' if not
 */
export function getStatusFromLastUpdate(lastUpdated: string | Date): 'active' | 'deprecated' {
  const lastUpdateDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated

  // Check if date is valid
  if (isNaN(lastUpdateDate.getTime())) {
    return 'deprecated'
  }

  const now = new Date()
  const monthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - STATUS_THRESHOLD_MONTHS,
    now.getDate(),
  )

  return lastUpdateDate >= monthsAgo ? 'active' : 'deprecated'
}

/**
 * Check if a status represents an active project
 * @param status - Status string to check
 * @returns True if status is 'active'
 */
export function isActiveStatus(status: UnifiedProjectStatus | string): boolean {
  return status === 'active'
}
