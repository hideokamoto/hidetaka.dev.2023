type BackgroundDecorationProps = {
  variant?: 'hero' | 'section' | 'custom'
  className?: string
}

export default function BackgroundDecoration({ 
  variant = 'hero',
  className = '' 
}: BackgroundDecorationProps) {
  if (variant === 'hero') {
    return (
      <>
        {/* Background decoration */}
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/20" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/15" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-900/10" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </>
    )
  }

  if (variant === 'section') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-900/10" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-100/30 blur-3xl dark:bg-purple-900/10" />
      </div>
    )
  }

  // custom variant - no default decoration
  return null
}

