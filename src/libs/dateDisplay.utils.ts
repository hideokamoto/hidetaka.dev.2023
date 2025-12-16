/**
 * Date display utility functions
 * Pure functions for date formatting logic following Kent Beck's unit testing principles
 */

export type DateFormat = 'short' | 'long' | 'month-year'

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
  switch (format) {
    case 'short':
      return {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    case 'long':
      return {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    case 'month-year':
      return {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }
  }
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
    console.warn('Invalid date:', date)
    return null
  }

  return formatDateDisplay(dateObj, lang, format)
}
