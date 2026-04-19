type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}: PageHeaderProps) {
  return (
    <header
      className={className}
      style={{
        paddingBlock: 'var(--space-12) var(--space-10)',
        borderBottom: '1px solid var(--color-line-strong)',
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginBottom: 'var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <span
            style={{
              width: '32px',
              height: '1px',
              background: 'var(--color-accent)',
              flexShrink: 0,
            }}
          />
          {eyebrow}
        </div>
      )}
      <h1
        className={titleClassName}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 900,
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--color-ink)',
          marginBottom: description ? 'var(--space-4)' : 0,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          className={descriptionClassName}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginTop: 'var(--space-3)',
          }}
        >
          {description}
        </p>
      )}
    </header>
  )
}
