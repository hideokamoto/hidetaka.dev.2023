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
  className = ''
}: FilterItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
          : 'text-slate-700 hover:bg-zinc-50 dark:text-slate-300 dark:hover:bg-zinc-800'
      } ${className}`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
          active
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

