type GradientBadgeProps = {
  children: React.ReactNode
  gradient: string
  className?: string
}

export default function GradientBadge({ 
  children, 
  gradient,
  className = '' 
}: GradientBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r ${gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-md ${className}`}
    >
      {children}
    </div>
  )
}

