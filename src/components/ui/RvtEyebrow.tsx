type RvtEyebrowProps = {
  children: React.ReactNode
  tone?: 'accent' | 'muted'
  className?: string
}

export default function RvtEyebrow({ children, tone = 'accent', className }: RvtEyebrowProps) {
  return (
    <p
      className={className}
      style={{
        margin: 0,
        fontFamily: 'var(--rvt-font-mono)',
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: tone === 'accent' ? 'var(--rvt-accent)' : 'var(--rvt-fg3)',
      }}
    >
      {children}
    </p>
  )
}
