type TagProps = {
  children: React.ReactNode
  variant?: 'default' | 'purple' | 'indigo'
  size?: 'sm' | 'md'
  className?: string
}

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: TagProps) {
  const baseStyles = 'inline-flex items-center rounded-lg font-semibold'

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  }

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
