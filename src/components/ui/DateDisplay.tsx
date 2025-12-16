import { type DateFormat, parseDateAndFormat } from '@/libs/dateDisplay.utils'

type DateDisplayProps = {
  date: Date | string
  lang: string
  format?: DateFormat
  className?: string
}

export default function DateDisplay({
  date,
  lang,
  format = 'short',
  className = '',
}: DateDisplayProps) {
  const formattedDate = parseDateAndFormat(date, lang, format)

  if (formattedDate === null) {
    return null
  }

  return <time className={className}>{formattedDate}</time>
}
