'use client'

import { useState } from 'react'

type RvtButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  href?: string
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

const sizes = {
  sm: { padding: '8px 16px', fontSize: '12.5px' },
  md: { padding: '14px 28px', fontSize: '14px' },
  lg: { padding: '16px 32px', fontSize: '15px' },
} as const

export default function RvtButton({
  variant = 'primary',
  size = 'md',
  arrow = false,
  href,
  disabled = false,
  onClick,
  children,
  className,
}: RvtButtonProps) {
  const [hover, setHover] = useState(false)

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--rvt-font-display)',
    fontWeight: 600,
    borderRadius: 'var(--rvt-radius-md)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition:
      'transform .2s ease, box-shadow .2s ease, opacity .2s ease, border-color .2s ease, color .2s ease',
    transform: hover && !disabled ? 'translateY(-1px)' : 'none',
    ...sizes[size],
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--rvt-accent)',
      color: '#fff',
      boxShadow: hover && !disabled ? 'var(--rvt-shadow-cta-hover)' : 'var(--rvt-shadow-cta)',
    },
    secondary: {
      background: 'transparent',
      color: hover && !disabled ? 'var(--rvt-fg)' : 'var(--rvt-fg2)',
      borderColor: hover && !disabled ? 'var(--rvt-accent)' : 'var(--rvt-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--rvt-accent)',
      padding: '0',
      border: 'none',
    },
  }

  const composed: React.CSSProperties = { ...base, ...variants[variant] }

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: composed,
    className,
  }

  const content = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          style={{
            transition: 'transform .2s ease',
            transform: hover ? 'translateX(2px)' : 'none',
          }}
        >
          →
        </span>
      )}
    </>
  )

  if (href && !disabled) {
    return (
      <a href={href} {...handlers}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} {...handlers}>
      {content}
    </button>
  )
}
