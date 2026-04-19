type TagVariant = 'default' | 'active' | 'indigo' | 'purple' | 'green'
type TagSize = 'sm' | 'md' | 'lg'

type TagProps = {
  children: React.ReactNode
  variant?: TagVariant
  size?: TagSize
  className?: string
  pressed?: boolean
}

const variantStyles: Record<TagVariant, React.CSSProperties> = {
  default: { color: 'var(--color-muted)', borderColor: 'var(--color-line-strong)' },
  active: {
    color: 'var(--color-bg)',
    borderColor: 'var(--color-ink)',
    background: 'var(--color-ink)',
  },
  indigo: { color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.35)' },
  purple: { color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.35)' },
  green: { color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.35)' },
}

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  pressed = false,
}: TagProps) {
  const effectiveVariant: TagVariant = pressed ? 'active' : variant

  const sizeMap: Record<TagSize, string> = {
    sm: 'var(--text-xs)',
    md: 'var(--text-sm)',
    lg: 'var(--text-base)',
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: sizeMap[size],
        letterSpacing: 'var(--tracking-wide)',
        padding: 'var(--space-1) var(--space-3)',
        border: '1px solid',
        transition: 'color var(--duration-fast), border-color var(--duration-fast)',
        whiteSpace: 'nowrap',
        ...variantStyles[effectiveVariant],
      }}
    >
      {children}
    </span>
  )
}
