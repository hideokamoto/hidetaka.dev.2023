import Link from 'next/link'

type CTAButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  className = '',
}: CTAButtonProps) {
  const baseStyles =
    'group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl'

  const variantStyles = {
    primary:
      'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 dark:bg-indigo-500 dark:hover:bg-indigo-400',
    secondary:
      'border border-zinc-200 bg-white text-zinc-900 shadow-zinc-500/20 hover:bg-zinc-50 hover:shadow-zinc-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
  }

  return (
    <Link href={href} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}
