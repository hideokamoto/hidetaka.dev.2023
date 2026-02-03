/**
 * Date display utility functions
 * Pure functions for date formatting logic following Kent Beck's unit testing principles
 */

import { logger } from './logger'

export type DateFormat = 'short' | 'long' | 'month-year'

// Date format options constants (defined at module level for performance)
const DATE_FORMAT_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
  long: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  'month-year': {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  },
} as const

/**
 * Parse date input to Date object
 * @param date - Date object or ISO date string
 * @returns Date object
 */
export function parseDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Check if a date is valid
 * @param date - Date object to validate
 * @returns true if date is valid, false otherwise
 */
export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

/**
 * Get locale string for date formatting
 * @param lang - Language code ('ja' or 'en')
 * @returns Locale string ('ja-JP' or 'en-US')
 */
export function getDateLocale(lang: string): string {
  return lang.startsWith('ja') ? 'ja-JP' : 'en-US'
}

/**
 * Get Intl.DateTimeFormatOptions for the specified format
 * @param format - Date format type
 * @returns DateTimeFormatOptions object
 */
export function getDateFormatOptions(format: DateFormat): Intl.DateTimeFormatOptions {
  return DATE_FORMAT_OPTIONS[format]
}

/**
 * Format date with locale and format options
 * @param date - Date object to format
 * @param lang - Language code
 * @param format - Date format type
 * @returns Formatted date string
 */
export function formatDateDisplay(date: Date, lang: string, format: DateFormat = 'short'): string {
  const locale = getDateLocale(lang)
  const options = getDateFormatOptions(format)
  return date.toLocaleDateString(locale, options)
}

/**
 * Parse and format date with validation
 * @param date - Date object or ISO date string
 * @param lang - Language code
 * @param format - Date format type
 * @returns Formatted date string or null if invalid
 */
export function parseDateAndFormat(
  date: Date | string,
  lang: string,
  format: DateFormat = 'short',
): string | null {
  const dateObj = parseDate(date)

  if (!isValidDate(dateObj)) {
    logger.warn('Invalid date', { date: String(date) })
    return null
  }

  return formatDateDisplay(dateObj, lang, format)
}

/**
 * Safely parse a date with detailed error logging
 * Returns null instead of falling back to current date for invalid inputs
 *
 * @param datetime - Date string to parse
 * @param context - Additional context for logging (e.g., articleTitle, source)
 * @returns Date object if valid, null if invalid
 *
 * @example
 * const date = parseDateSafely('2024-01-15', { articleTitle: 'My Post' })
 * if (date) {
 *   // Use valid date
 * } else {
 *   // Handle invalid date case
 * }
 */
export function parseDateSafely(
  datetime: string | undefined,
  context?: Record<string, unknown>,
): Date | null {
  // Check for missing datetime
  if (!datetime) {
    logger.warn('Missing datetime value', context)
    return null
  }

  try {
    const date = new Date(datetime)

    // Validate parsed date
    if (!isValidDate(date)) {
      logger.error('Invalid date format', {
        datetime,
        ...context,
      })
      return null
    }

    // Optional: Check for future dates and log warning
    const now = new Date()
    if (date > now) {
      logger.warn('Future date detected', {
        datetime,
        parsedDate: date.toISOString(),
        ...context,
      })
      // Still return the date - just warn about it
    }

    return date
  } catch (e) {
    logger.error('Date parsing exception', {
      datetime,
      error: e instanceof Error ? e.message : 'Unknown error',
      ...context,
    })
    return null
  }
}

/**
 * Parse date with fallback to a default date
 * Useful when you need a date value and can't accept null
 *
 * @param datetime - Date string to parse
 * @param fallback - Fallback date to use if parsing fails
 * @param context - Additional context for logging
 * @returns Parsed date or fallback date
 *
 * @example
 * const date = parseDateWithFallback('invalid', new Date(), { source: 'RSS' })
 * // Returns fallback date if parsing fails
 */
export function parseDateWithFallback(
  datetime: string | undefined,
  fallback: Date,
  context?: Record<string, unknown>,
): Date {
  const result = parseDateSafely(datetime, context)
  return result ?? fallback
}
