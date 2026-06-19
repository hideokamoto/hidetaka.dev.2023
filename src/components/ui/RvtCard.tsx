'use client'

import { useState } from 'react'

type RvtCardProps = {
  eyebrow?: string
  title?: string
  description?: string
  bullets?: string[]
  cta?: string
  href?: string
  accent?: 'top' | 'left' | 'none'
  children?: React.ReactNode
  className?: string
}

export default function RvtCard({
  eyebrow,
  title,
  description,
  bullets,
  cta,
  href,
  accent = 'top',
  children,
  className,
}: RvtCardProps) {
  const [hover, setHover] = useState(false)
  const Tag = href ? 'a' : 'div'

  const wrap: React.CSSProperties = {
    position: 'relative',
    display: 'block',
    overflow: 'hidden',
    borderRadius: 'var(--rvt-radius)',
    border: `1px solid ${hover ? 'var(--rvt-border-accent)' : 'var(--rvt-border)'}`,
    background: 'var(--rvt-bg2)',
    padding: '32px',
    textDecoration: 'none',
    transform: hover ? 'translateY(-4px)' : 'none',
    transition: 'transform .3s ease, border-color .3s ease',
  }

  const topRule: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'var(--rvt-accent)',
    transformOrigin: 'left',
    transform: hover ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform .3s ease',
  }

  const leftBar: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '3px',
    background: 'var(--rvt-accent)',
    opacity: hover ? 1 : 0,
    transition: 'opacity .3s ease',
  }

  const linkProps = href ? { href } : {}

  return (
    <Tag
      {...linkProps}
      style={wrap}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {accent === 'top' && <span style={topRule} aria-hidden="true" />}
      {accent === 'left' && <span style={leftBar} aria-hidden="true" />}

      {eyebrow && (
        <p
          style={{
            margin: '0 0 20px',
            fontFamily: 'var(--rvt-font-mono)',
            fontSize: '11px',
            letterSpacing: '0.05em',
            color: 'var(--rvt-accent)',
          }}
        >
          {eyebrow}
        </p>
      )}

      {title && (
        <h3
          style={{
            margin: '0 0 14px',
            fontFamily: 'var(--rvt-font-display)',
            fontSize: '19px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--rvt-fg)',
          }}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          style={{
            margin: '0 0 24px',
            fontSize: '13.5px',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'var(--rvt-fg2)',
          }}
        >
          {description}
        </p>
      )}

      {bullets && bullets.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: '0 0 28px',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {bullets.map((b) => (
            <li
              key={b}
              style={{
                display: 'flex',
                gap: '8px',
                fontFamily: 'var(--rvt-font-mono)',
                fontSize: '12.5px',
                color: 'var(--rvt-fg2)',
              }}
            >
              <span style={{ color: 'var(--rvt-accent)', flexShrink: 0 }} aria-hidden="true">
                →
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {children}

      {cta && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--rvt-font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--rvt-accent)',
          }}
        >
          {cta} <span aria-hidden="true">→</span>
        </span>
      )}
    </Tag>
  )
}
