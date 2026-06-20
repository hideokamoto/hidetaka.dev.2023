type BackgroundDecorationProps = {
  variant?: 'hero' | 'section' | 'custom'
  className?: string
}

export default function BackgroundDecoration({
  variant = 'hero',
  className = '',
}: BackgroundDecorationProps) {
  if (variant === 'hero') {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--rvt-accent-glow) 0%, transparent 65%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: '20%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--rvt-accent2) 15%, transparent) 0%, transparent 65%)',
          }}
        />
      </div>
    )
  }

  if (variant === 'section') {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '25%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--rvt-accent) 8%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '25%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--rvt-accent2) 8%, transparent) 0%, transparent 70%)',
          }}
        />
      </div>
    )
  }

  return null
}
