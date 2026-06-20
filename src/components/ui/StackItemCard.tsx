import GradientBadge from './GradientBadge'

type StackItemCardProps = {
  name: string
  description: string
  gradient: string
  focusLabel?: string
  className?: string
}

export default function StackItemCard({
  name,
  description,
  gradient,
  focusLabel,
  className = '',
}: StackItemCardProps) {
  return (
    <div
      className={`group flex flex-col items-center justify-center rounded-2xl p-8 text-center transition-all hover:shadow-lg hover:border-indigo-200 ${className}`}
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <GradientBadge gradient={gradient}>{name}</GradientBadge>
      {focusLabel && (
        <p
          className="mt-6 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--rvt-fg2)' }}
        >
          {focusLabel}
        </p>
      )}
      <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: 'var(--rvt-fg2)' }}>
        {description}
      </p>
    </div>
  )
}
