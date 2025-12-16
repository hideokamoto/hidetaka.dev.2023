/**
 * Component style utility functions
 * Pure functions for component styling logic following Kent Beck's unit testing principles
 */

// Badge component types
export type BadgeVariant = 'default' | 'indigo'

/**
 * Get variant-specific styles for Badge component
 * @param variant - Badge variant type
 * @returns Object containing variant, text, and dot styles
 */
export function getBadgeStyles(variant: BadgeVariant) {
  const variantStyles = {
    default: 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-500/30 dark:bg-zinc-500/10',
    indigo: 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10',
  }

  const textStyles = {
    default: 'text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400',
    indigo: 'text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400',
  }

  const dotStyles = {
    default: 'h-2 w-2 rounded-full bg-zinc-500 animate-pulse',
    indigo: 'h-2 w-2 rounded-full bg-indigo-500 animate-pulse',
  }

  return {
    variant: variantStyles[variant],
    text: textStyles[variant],
    dot: dotStyles[variant],
  }
}

// Tag component types
export type TagVariant = 'default' | 'purple' | 'indigo'
export type TagSize = 'sm' | 'md'

/**
 * Get size-specific styles for Tag component
 * @param size - Tag size
 * @returns CSS class string for the size
 */
export function getTagSizeStyles(size: TagSize): string {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  }

  return sizeStyles[size]
}

/**
 * Get variant-specific styles for Tag component
 * @param variant - Tag variant type
 * @returns CSS class string for the variant
 */
export function getTagVariantStyles(variant: TagVariant): string {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  }

  return variantStyles[variant]
}

/**
 * Get complete styles for Tag component
 * @param variant - Tag variant type
 * @param size - Tag size
 * @returns Object containing size and variant styles
 */
export function getTagStyles(variant: TagVariant, size: TagSize) {
  return {
    size: getTagSizeStyles(size),
    variant: getTagVariantStyles(variant),
  }
}

// SectionHeader component types
export type SectionHeaderAlign = 'left' | 'center' | 'right'

/**
 * Get alignment styles for SectionHeader component
 * @param align - Alignment type
 * @returns CSS class string for the alignment
 */
export function getSectionHeaderAlignStyles(align: SectionHeaderAlign): string {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return alignStyles[align]
}
