import { getTagStyles, type TagSize, type TagVariant } from '@/libs/componentStyles.utils'

type TagProps = {
  children: React.ReactNode
  variant?: TagVariant
  size?: TagSize
  className?: string
}

export default function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: TagProps) {
  const baseStyles = 'inline-flex items-center rounded-lg font-semibold'

  const styles = getTagStyles(variant, size)

  return (
    <span className={`${baseStyles} ${styles.size} ${styles.variant} ${className}`}>
      {children}
    </span>
  )
}
