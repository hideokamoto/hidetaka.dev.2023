type DateDisplayProps = {
  date: Date | string
  lang: string
  format?: 'short' | 'long' | 'month-year'
  className?: string
}

export default function DateDisplay({
  date,
  lang,
  format = 'short',
  className = '',
}: DateDisplayProps) {
  // Handle string dates (from RSS feeds)
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if date is valid
  if (Number.isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date)
    return null
  }

  let formattedDate: string

  if (format === 'short') {
    formattedDate = dateObj.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } else if (format === 'long') {
    formattedDate = dateObj.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } else {
    // month-year
    formattedDate = dateObj.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return <time className={className}>{formattedDate}</time>
}
