type FilterItemProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
  className?: string
}

export default function FilterItem({
  active,
  onClick,
  children,
  count,
  className = '',
}: FilterItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${className}`}
      style={
        active
          ? {
              background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
              color: 'var(--rvt-accent)',
            }
          : { color: 'var(--rvt-fg2)' }
      }
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className="ml-2 rounded-full px-2 py-0.5 text-xs"
          style={
            active
              ? {
                  background: 'color-mix(in oklch, var(--rvt-accent) 15%, transparent)',
                  color: 'var(--rvt-accent)',
                }
              : {
                  background: 'var(--rvt-bg3)',
                  color: 'var(--rvt-fg3)',
                }
          }
        >
          {count > 20 ? '20+' : count}
        </span>
      )}
    </button>
  )
}
