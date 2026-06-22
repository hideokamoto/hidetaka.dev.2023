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
  className = '',
}: MobileFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all hover:border-indigo-300 hover:bg-indigo-50 ${className}`}
      style={{
        border: '1px solid var(--rvt-border)',
        background: 'var(--rvt-bg2)',
        color: 'var(--rvt-fg)',
      }}
    >
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
              color: 'var(--rvt-accent)',
            }}
          >
            {activeFilterCount}
          </span>
        )}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </div>
    </button>
  )
}
