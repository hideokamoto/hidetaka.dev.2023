import type { MicroCMSProjectStatus } from './microCMS/types'

/**
 * Status threshold for determining if a project is deprecated
 * Projects not updated within this period are considered deprecated
 */
export const STATUS_THRESHOLD_MONTHS = 6

/**
 * Unified project status type that works across all data sources
 * (microCMS, npm packages, WordPress plugins)
 */
export type UnifiedProjectStatus = MicroCMSProjectStatus

/**
 * Determine project status based on last update date
 * If last updated more than STATUS_THRESHOLD_MONTHS ago, returns 'deprecated'
 * Otherwise returns 'active'
 *
 * @param lastUpdated - Last update date as string or Date object
 * @returns 'active' or 'deprecated' status
 */
export function getStatusFromLastUpdate(lastUpdated: string | Date): 'active' | 'deprecated' {
  try {
    const lastUpdateDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated
    const now = new Date()

    // Calculate months difference
    const monthsDifference =
      (now.getFullYear() - lastUpdateDate.getFullYear()) * 12 +
      (now.getMonth() - lastUpdateDate.getMonth())

    return monthsDifference >= STATUS_THRESHOLD_MONTHS ? 'deprecated' : 'active'
  } catch {
    // If date parsing fails, default to active
    return 'active'
  }
}

/**
 * Check if a project status is considered active
 * Used for filtering logic (e.g., showing only active items in Active Products section)
 *
 * @param status - Project status to check
 * @returns true if status is 'active', false otherwise
 */
export function isActiveStatus(status: UnifiedProjectStatus | string): boolean {
  return status === 'active'
}

/**
 * Get the badge variant for a given status
 * Maps project status to visual badge variants
 *
 * @param status - Project status
 * @returns Badge variant: 'green' for active, 'gray' for others
 */
export function getStatusBadgeVariant(status: UnifiedProjectStatus): 'green' | 'gray' {
  return status === 'active' ? 'green' : 'gray'
}

/**
 * Get localized status label
 *
 * @param status - Project status
 * @param lang - Language code ('ja' or 'en')
 * @returns Localized status label
 */
export function getStatusLabel(status: UnifiedProjectStatus, lang: string): string {
  const labels: Record<UnifiedProjectStatus, Record<string, string>> = {
    active: { ja: 'アクティブ', en: 'Active' },
    deprecated: { ja: '非推奨', en: 'Deprecated' },
    archived: { ja: 'アーカイブ', en: 'Archived' },
    completed: { ja: '完了', en: 'Completed' },
  }

  const isJapanese = lang.startsWith('ja')
  return labels[status][isJapanese ? 'ja' : 'en']
}
