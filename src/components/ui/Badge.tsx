type BadgeProps = {
  label: string
  variant?: 'default' | 'indigo'
  className?: string
}

export default function Badge({ label, variant = 'indigo', className = '' }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-sm shadow-sm'

  const variantStyles = {
    default: 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-500/30 dark:bg-zinc-500/10',
    indigo: 'border-indigo-200 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10',
  }

  const textStyles = {
    default: 'text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400',
    indigo: 'text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400',
  }

  const dotStyles = {
    default: 'h-2 w-2 rounded-full bg-zinc-500 animate-pulse',
    indigo: 'h-2 w-2 rounded-full bg-indigo-500 animate-pulse',
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <span className={dotStyles[variant]} />
      <p className={textStyles[variant]}>{label}</p>
    </div>
  )
}
