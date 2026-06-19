type RvtBadgeTone = 'tint' | 'outline' | 'success' | 'warning' | 'error'

type RvtBadgeProps = {
  tone?: RvtBadgeTone
  children: React.ReactNode
  className?: string
}

const tones: Record<RvtBadgeTone, React.CSSProperties> = {
  tint: {
    background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)',
    color: 'var(--rvt-accent)',
    borderColor: 'transparent',
  },
  outline: {
    background: 'transparent',
    borderColor: 'var(--rvt-border)',
    color: 'var(--rvt-fg2)',
  },
  success: {
    background: 'color-mix(in oklch, var(--success) 14%, transparent)',
    color: 'var(--success)',
    borderColor: 'transparent',
  },
  warning: {
    background: 'color-mix(in oklch, var(--warning) 16%, transparent)',
    color: 'var(--warning)',
    borderColor: 'transparent',
  },
  error: {
    background: 'color-mix(in oklch, var(--error) 14%, transparent)',
    color: 'var(--error)',
    borderColor: 'transparent',
  },
}

export default function RvtBadge({ tone = 'tint', children, className }: RvtBadgeProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--rvt-font-mono)',
    fontSize: '11px',
    letterSpacing: '0.02em',
    lineHeight: 1,
    padding: '5px 10px',
    borderRadius: 'var(--rvt-radius-sm)',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  }

  return (
    <span style={{ ...base, ...tones[tone] }} className={className}>
      {children}
    </span>
  )
}
