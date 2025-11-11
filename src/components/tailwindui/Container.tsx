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
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`} style={style}>
      {children}
    </div>
  )
}

