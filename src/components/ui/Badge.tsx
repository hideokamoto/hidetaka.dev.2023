import { type BadgeVariant, getBadgeStyles } from '@/libs/componentStyles.utils'

type BadgeProps = {
  label: string
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ label, variant = 'indigo', className = '' }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-sm shadow-sm'

  const styles = getBadgeStyles(variant)

  return (
    <div className={`${baseStyles} ${styles.variant} ${className}`}>
      <span className={styles.dot} />
      <p className={styles.text}>{label}</p>
    </div>
  )
}
