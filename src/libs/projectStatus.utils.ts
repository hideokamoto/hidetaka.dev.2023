/**
 * Project status utilities for determining and managing project lifecycle states
 */

// Threshold for determining if a project is active (6 months)
export const STATUS_THRESHOLD_MONTHS = 6

/**
 * Unified project status type for all data sources
 */
export type UnifiedProjectStatus = 'active' | 'deprecated' | 'archived' | 'completed'

/**
 * Get status based on last update date
 * Projects updated within the threshold are considered 'active', otherwise 'deprecated'
 * @param lastUpdated - Last update date as string or Date (can be undefined)
 * @returns Status: 'active' or 'deprecated'
 */
export function getStatusFromLastUpdate(
  lastUpdated: string | Date | undefined,
): 'active' | 'deprecated' {
  if (!lastUpdated) {
    return 'active'
  }

  const lastUpdateDate = new Date(lastUpdated)

  // Check if date is valid
  if (Number.isNaN(lastUpdateDate.getTime())) {
    return 'active'
  }

  const now = new Date()

  // Calculate months difference
  const monthsDiff =
    (now.getFullYear() - lastUpdateDate.getFullYear()) * 12 +
    (now.getMonth() - lastUpdateDate.getMonth())

  return monthsDiff <= STATUS_THRESHOLD_MONTHS ? 'active' : 'deprecated'
}

/**
 * Check if a status represents an active project
 * @param status - Status string to check
 * @returns True if status is 'active'
 */
export function isActiveStatus(status: string | UnifiedProjectStatus | undefined): boolean {
  return status === 'active'
}

/**
 * Map project status to badge variant
 * @param status - Project status
 * @returns Badge variant string
 */
export function statusToBadgeVariant(status: UnifiedProjectStatus | undefined): 'green' | 'gray' {
  return status === 'active' ? 'green' : 'gray'
}

/**
 * Get display label for status
 * @param status - Project status
 * @param lang - Language ('en' or 'ja')
 * @returns Localized status label
 */
export function getStatusLabel(status: UnifiedProjectStatus | undefined, lang: string): string {
  const labels: Record<UnifiedProjectStatus, Record<string, string>> = {
    active: { en: 'Active', ja: 'アクティブ' },
    deprecated: { en: 'Deprecated', ja: '非推奨' },
    archived: { en: 'Archived', ja: 'アーカイブ' },
    completed: { en: 'Completed', ja: '完了' },
  }

  const finalStatus = status || 'active'
  return labels[finalStatus][lang === 'ja' ? 'ja' : 'en']
}
