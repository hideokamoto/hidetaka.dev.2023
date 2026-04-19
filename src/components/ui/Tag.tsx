type TagVariant = 'default' | 'active' | 'indigo' | 'purple' | 'green' | string
type TagSize = 'sm' | 'md' | 'lg'

type TagProps = {
  children: React.ReactNode
  variant?: TagVariant
  size?: TagSize
  className?: string
  pressed?: boolean
}

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  pressed = false,
}: TagProps) {
  const isActive = variant === 'active' || pressed

  const sizeMap: Record<TagSize, string> = {
    sm: 'var(--text-xs)',
    md: 'var(--text-xs)',
    lg: 'var(--text-sm)',
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
        border: '1px solid var(--color-line-strong)',
        color: isActive ? 'var(--color-bg)' : 'var(--color-muted)',
        background: isActive ? 'var(--color-ink)' : 'transparent',
        borderColor: isActive ? 'var(--color-ink)' : 'var(--color-line-strong)',
        transition: 'color var(--duration-fast), border-color var(--duration-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
