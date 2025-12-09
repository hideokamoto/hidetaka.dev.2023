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
        className={`text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl ${titleClassName}`}
      >
        {title}
      </h1>
      {description && (
        <p
          className={`mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400 ${descriptionClassName}`}
        >
          {description}
        </p>
      )}
    </header>
  )
}
