type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  label,
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          style={{ color: 'var(--rvt-fg3)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="block w-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors"
        style={{
          border: '1px solid var(--rvt-border)',
          background: 'var(--rvt-bg2)',
          color: 'var(--rvt-fg)',
          borderRadius: 'var(--rvt-radius-md)',
        }}
      />
    </div>
  )
}
