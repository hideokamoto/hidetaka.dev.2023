import DateDisplay from '@/components/ui/DateDisplay'
import { cn } from '@/libs/utils/cn'

type ArticleMetaProps = {
  published: Date | string
  updated?: Date | string | null
  lang: 'ja' | 'en'
  className?: string
}

function CalendarIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 flex-none"
      style={{ color: 'var(--rvt-fg3)' }}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.6}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  )
}

/**
 * 公開日 / 更新日のメタ情報行。
 * Revtrona Design System の website UI kit（BlogPost のメタ行）に準拠。
 */
export default function ArticleMeta({
  published,
  updated,
  lang,
  className = '',
}: ArticleMetaProps) {
  const publishedDate = new Date(published)
  const updatedDate = updated ? new Date(updated) : null
  // 公開日と同日（または無効値）の場合は更新日を表示しない
  const showUpdated =
    updatedDate !== null &&
    !Number.isNaN(updatedDate.getTime()) &&
    updatedDate.getTime() - publishedDate.getTime() > 24 * 60 * 60 * 1000

  const publishedLabel = lang === 'ja' ? '公開' : 'Published'
  const updatedLabel = lang === 'ja' ? '更新' : 'Updated'

  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-6 text-sm',
        className,
      )}
      style={{ borderColor: 'var(--rvt-border)', color: 'var(--rvt-fg2)' }}
    >
      <span className="flex items-center gap-1.5">
        <CalendarIcon />
        <span
          className="text-[11px]"
          style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg3)' }}
        >
          {publishedLabel}:
        </span>
        <DateDisplay date={publishedDate} lang={lang} format="long" />
      </span>
      {showUpdated && updatedDate && (
        <span className="flex items-center gap-1.5">
          <CalendarIcon />
          <span
            className="text-[11px]"
            style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg3)' }}
          >
            {updatedLabel}:
          </span>
          <DateDisplay date={updatedDate} lang={lang} format="long" />
        </span>
      )}
    </div>
  )
}
