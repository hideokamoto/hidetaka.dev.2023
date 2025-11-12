import { ReactNode } from 'react'

export default function Container({ 
  children, 
  className = '',
  style
}: { 
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 ${className}`} style={style}>
      {children}
    </div>
  )
}

