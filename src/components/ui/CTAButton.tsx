import Link from 'next/link'
import { getCTAButtonStyles } from '@/libs/componentStyles.utils'
import type { CTAButtonVariant } from '@/libs/componentStyles.utils'

type CTAButtonProps = {
  href: string
  children: React.ReactNode
  variant?: CTAButtonVariant
  className?: string
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  className = '',
}: CTAButtonProps) {
  const buttonStyles = getCTAButtonStyles(variant)
  const classNames = buttonStyles + (className ? ` ${className}` : '')

  return (
    <Link href={href} className={classNames}>
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}
