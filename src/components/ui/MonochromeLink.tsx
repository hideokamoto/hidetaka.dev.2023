'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

type MonochromeLinkProps = {
  href: string
  style: CSSProperties
  children: ReactNode
}

export default function MonochromeLink({ href, style, children }: MonochromeLinkProps) {
  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-muted)'
      }}
    >
      {children}
    </Link>
  )
}
