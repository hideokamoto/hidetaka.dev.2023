type PageHeaderProps = {
  title: string
  eyebrow?: string
  sub?: string
  meta?: string[]
  description?: string
  className?: string
  children?: React.ReactNode
}

export default function PageHeader({
  title,
  eyebrow,
  sub,
  meta,
  description,
  className = '',
  children,
}: PageHeaderProps) {
  return (
    <header className={`ds-page-header ${className}`}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: children ? '1fr auto' : '1fr',
          gap: '40px',
          alignItems: 'end',
        }}
      >
        <div>
          {eyebrow && <div className="ds-page-header__eyebrow">{eyebrow}</div>}
          <h1 className="ds-page-header__title">{title}</h1>
          {sub && <p className="ds-page-header__sub">{sub}</p>}
          {description && (
            <p
              style={{
                marginTop: '16px',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-ink-2)',
                lineHeight: 'var(--leading-loose)',
                maxWidth: '56ch',
              }}
            >
              {description}
            </p>
          )}
          {meta && meta.length > 0 && (
            <div className="ds-page-header__meta">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    </header>
  )
}
