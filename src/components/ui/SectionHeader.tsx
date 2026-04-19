type SectionHeaderProps = {
  title: string
  description?: string
  number?: string
  actionLabel?: string
  actionHref?: string
  align?: 'left' | 'center'
  className?: string
}

export default function SectionHeader({
  title,
  description,
  number,
  actionLabel,
  actionHref,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  if (align === 'center') {
    return (
      <div className={className} style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 900,
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-ink)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase' as const,
              color: 'var(--color-muted)',
            }}
          >
            {description}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--grid-gap)',
        paddingBottom: 'var(--space-5)',
        borderBottom: '1px solid var(--color-line-strong)',
        marginBottom: 'var(--space-7)',
        alignItems: 'baseline',
      }}
    >
      {number && (
        <div
          style={{
            gridColumn: 'span 2',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase' as const,
            color: 'var(--color-muted)',
          }}
        >
          {number}
        </div>
      )}
      <div style={{ gridColumn: number ? 'span 7' : actionLabel ? 'span 9' : 'span 12' }}>
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 900,
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-ink)',
          }}
        >
          {title}
        </h2>
        {description && (
          <small
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase' as const,
              color: 'var(--color-muted)',
              fontWeight: 400,
              marginTop: 'var(--space-3)',
            }}
          >
            {description}
          </small>
        )}
      </div>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          style={{
            gridColumn: 'span 3',
            justifySelf: 'end' as const,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase' as const,
            color: 'var(--color-muted)',
            transition: 'color var(--duration-fast)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'
          }}
        >
          {actionLabel} →
        </a>
      )}
    </div>
  )
}
