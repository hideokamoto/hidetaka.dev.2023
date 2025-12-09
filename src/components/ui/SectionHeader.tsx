type SectionHeaderProps = {
  title: string
  description?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function SectionHeader({
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={`mx-auto max-w-3xl ${alignStyles[align]} ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}
