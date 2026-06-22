import { getSectionHeaderAlignStyles, type SectionHeaderAlign } from '@/libs/componentStyles.utils'

type SectionHeaderProps = {
  title: string
  description?: string
  align?: SectionHeaderAlign
  className?: string
}

export default function SectionHeader({
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignStyles = getSectionHeaderAlignStyles(align)

  return (
    <div className={`mx-auto max-w-3xl ${alignStyles} ${className}`}>
      <h2
        className="text-3xl font-bold tracking-tight sm:text-4xl"
        style={{
          fontFamily: 'var(--rvt-font-display)',
          color: 'var(--rvt-fg)',
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--rvt-fg2)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
