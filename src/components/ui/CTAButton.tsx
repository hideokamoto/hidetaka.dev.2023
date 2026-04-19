import Link from 'next/link'

type CTAButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline'
type CTAButtonSize = 'sm' | 'md' | 'lg'

type CTAButtonProps = {
  href: string
  children: React.ReactNode
  variant?: CTAButtonVariant
  size?: CTAButtonSize
  className?: string
  external?: boolean
}

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 700,
  letterSpacing: 'var(--tracking-wide)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition:
    'background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
}

const sizeStyles: Record<CTAButtonSize, React.CSSProperties> = {
  sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)' },
  md: { padding: 'var(--space-4) var(--space-7)' },
  lg: { padding: 'var(--space-5) var(--space-9)', fontSize: 'var(--text-base)' },
}

const borderedStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--color-ink)',
  borderColor: 'var(--color-ink)',
}

const variantStyles: Record<CTAButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-ink)',
    color: 'var(--color-bg)',
    borderColor: 'var(--color-ink)',
  },
  secondary: borderedStyle,
  outline: borderedStyle,
  ghost: {
    background: 'transparent',
    color: 'var(--color-muted)',
    borderColor: 'var(--color-line-strong)',
  },
  accent: {
    background: 'var(--color-accent)',
    color: 'var(--color-accent-fg)',
    borderColor: 'var(--color-accent)',
  },
}

const arrowStyle: React.CSSProperties = {
  transition: 'transform var(--duration-fast)',
  display: 'inline-block',
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  external = false,
}: CTAButtonProps) {
  const style = { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }
  const showArrow = variant === 'primary' || variant === 'accent'

  const arrow = showArrow ? <span style={arrowStyle}>→</span> : null

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
        {arrow}
      </a>
    )
  }

  return (
    <Link href={href} className={className} style={style}>
      {children}
      {arrow}
    </Link>
  )
}
