type MobileFilterButtonProps = {
  onClick: () => void
  activeFilterCount: number
  label?: string
  className?: string
}

export default function MobileFilterButton({
  onClick,
  activeFilterCount,
  label = 'Filter',
  className = ''
}: MobileFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 ${className}`}
    >
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {activeFilterCount}
          </span>
        )}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>
    </button>
  )
}

