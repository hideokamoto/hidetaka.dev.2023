type BadgeVariant = 'default' | 'accent' | 'ink' | 'status' | 'indigo' | 'green' | 'gray' | 'purple'

type BadgeProps = {
  label: string
  variant?: BadgeVariant
  className?: string
}

function getVariantStyle(variant: BadgeVariant): React.CSSProperties {
  switch (variant) {
    case 'accent':
    case 'green':
      return {
        background: 'var(--color-accent)',
        color: 'var(--color-accent-fg)',
        borderColor: 'var(--color-accent)',
      }
    case 'ink':
    case 'indigo':
    case 'purple':
      return {
        background: 'var(--color-ink)',
        color: 'var(--color-bg)',
        borderColor: 'var(--color-ink)',
      }
    case 'status':
    case 'gray':
    case 'default':
    default:
      return {}
  }
}

export default function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-2xs)',
    letterSpacing: 'var(--tracking-wider)',
    textTransform: 'uppercase',
    padding: '3px var(--space-3)',
    border: '1px solid var(--color-line-strong)',
    color: 'var(--color-muted)',
    whiteSpace: 'nowrap',
  }

  const isStatus = variant === 'status'

  return (
    <span className={className} style={{ ...baseStyle, ...getVariantStyle(variant) }}>
      {isStatus && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '100px',
            background: 'var(--color-accent)',
            boxShadow: '0 0 0 2px color-mix(in oklab, var(--color-accent) 22%, transparent)',
            animation: 'hdk-pulse 2.4s infinite',
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  )
}
