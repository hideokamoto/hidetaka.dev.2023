import GradientBadge from './GradientBadge'

type StackItemCardProps = {
  name: string
  description: string
  gradient: string
  focusLabel?: string
  href?: string
  linkLabel?: string
  className?: string
}

export default function StackItemCard({
  name,
  description,
  gradient,
  focusLabel,
  href,
  linkLabel,
  className = '',
}: StackItemCardProps) {
  const baseClassName = `group flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 ${className}`

  const content = (
    <>
      <GradientBadge gradient={gradient}>{name}</GradientBadge>
      {focusLabel && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {focusLabel}
        </p>
      )}
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
        {description}
      </p>
      {href && linkLabel && (
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
          {linkLabel}
          <span aria-hidden="true">↗</span>
        </p>
      )}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={linkLabel ? `${name} — ${linkLabel}` : name}
        className={baseClassName}
      >
        {content}
      </a>
    )
  }

  return <div className={baseClassName}>{content}</div>
}
