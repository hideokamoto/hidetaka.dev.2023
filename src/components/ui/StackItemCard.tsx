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
  className = '' 
}: StackItemCardProps) {
  return (
    <div
      className={`group flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center transition-all hover:shadow-lg hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 ${className}`}
    >
      <GradientBadge gradient={gradient}>
        {name}
      </GradientBadge>
      {focusLabel && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {focusLabel}
        </p>
      )}
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
        {description}
      </p>
    </div>
  )
}

