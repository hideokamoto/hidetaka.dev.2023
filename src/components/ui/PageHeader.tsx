type PageHeaderProps = {
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export default function PageHeader({
  title,
  description,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}: PageHeaderProps) {
  return (
    <header className={`max-w-3xl mb-8 ${className}`}>
      <h1
        className={`text-4xl font-bold tracking-tight sm:text-5xl ${titleClassName}`}
        style={{
          fontFamily: 'var(--rvt-font-display)',
          color: 'var(--rvt-fg)',
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          className={`mt-3 text-lg leading-relaxed ${descriptionClassName}`}
          style={{ color: 'var(--rvt-fg2)' }}
        >
          {description}
        </p>
      )}
    </header>
  )
}
