/**
 * Component style utility functions
 * Pure functions for component styling logic following Kent Beck's unit testing principles
 */

// Badge component types
export type BadgeVariant = 'default' | 'indigo' | 'green' | 'gray'

// Badge style constants (defined at module level for performance)
const BADGE_VARIANT_STYLES = {
  default: 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-500/30 dark:bg-zinc-500/10',
  indigo: 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10',
  green: 'border-green-200 bg-green-50/80 dark:border-green-500/30 dark:bg-green-500/10',
  gray: 'border-zinc-300 bg-zinc-100/80 dark:border-zinc-500/40 dark:bg-zinc-600/20',
} as const

const BADGE_TEXT_STYLES = {
  default: 'text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400',
  indigo: 'text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400',
  green: 'text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400',
  gray: 'text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300',
} as const

const BADGE_DOT_STYLES = {
  default: 'h-2 w-2 rounded-full bg-zinc-500 animate-pulse',
  indigo: 'h-2 w-2 rounded-full bg-indigo-500 animate-pulse',
  green: 'h-2 w-2 rounded-full bg-green-500 animate-pulse',
  gray: 'h-2 w-2 rounded-full bg-zinc-400 animate-pulse',
} as const

/**
 * Get variant-specific styles for Badge component
 * @param variant - Badge variant type
 * @returns Object containing variant, text, and dot styles
 */
export function getBadgeStyles(variant: BadgeVariant) {
  return {
    variant: BADGE_VARIANT_STYLES[variant],
    text: BADGE_TEXT_STYLES[variant],
    dot: BADGE_DOT_STYLES[variant],
  }
}

// Tag component types
export type TagVariant = 'default' | 'purple' | 'indigo'
export type TagSize = 'sm' | 'md'

// Tag style constants (defined at module level for performance)
const TAG_SIZE_STYLES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
} as const

const TAG_VARIANT_STYLES = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
} as const

/**
 * Get complete styles for Tag component
 * @param variant - Tag variant type
 * @param size - Tag size
 * @returns Object containing size and variant styles
 */
export function getTagStyles(variant: TagVariant, size: TagSize) {
  return {
    size: TAG_SIZE_STYLES[size],
    variant: TAG_VARIANT_STYLES[variant],
  }
}

// SectionHeader component types
export type SectionHeaderAlign = 'left' | 'center' | 'right'

// SectionHeader style constants (defined at module level for performance)
const SECTION_HEADER_ALIGN_STYLES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

/**
 * Get alignment styles for SectionHeader component
 * @param align - Alignment type
 * @returns CSS class string for the alignment
 */
export function getSectionHeaderAlignStyles(align: SectionHeaderAlign): string {
  return SECTION_HEADER_ALIGN_STYLES[align]
}

// CTA Button component types
export type CTAButtonVariant = 'primary' | 'secondary'

// CTA Button style constants (defined at module level for performance)
const CTA_BUTTON_BASE_STYLES =
  'group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl'

const CTA_BUTTON_VARIANT_STYLES = {
  primary:
    'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 dark:bg-indigo-500 dark:hover:bg-indigo-400',
  secondary:
    'border border-zinc-200 bg-white text-zinc-900 shadow-zinc-500/20 hover:bg-zinc-50 hover:shadow-zinc-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
} as const

/**
 * Get complete styles for CTA Button component
 * @param variant - Button variant type
 * @returns Combined base and variant styles
 */
export function getCTAButtonStyles(variant: CTAButtonVariant): string {
  return `${CTA_BUTTON_BASE_STYLES} ${CTA_BUTTON_VARIANT_STYLES[variant]}`
}

// Action Button component types (smaller than CTA buttons; used for article actions, etc.)
export type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'neutral'

// Action Button style constants (defined at module level for performance)
const ACTION_BUTTON_BASE_STYLES =
  'group inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:focus:ring-offset-zinc-900'

const ACTION_BUTTON_VARIANT_STYLES = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary:
    'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  neutral: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
} as const

/**
 * Get complete styles for Action Button component
 * @param variant - Button variant type
 * @returns Combined base and variant styles
 */
export function getActionButtonStyles(variant: ActionButtonVariant): string {
  return `${ACTION_BUTTON_BASE_STYLES} ${ACTION_BUTTON_VARIANT_STYLES[variant]}`
}
