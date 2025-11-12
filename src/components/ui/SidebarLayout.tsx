type SidebarLayoutProps = {
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: 'narrow' | 'wide'
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = 'narrow',
  gap = 'md',
  className = ''
}: SidebarLayoutProps) {
  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-8',
    lg: 'gap-12',
  }

  // narrow: 1/4 (lg:col-span-1 in 4-column grid)
  // wide: 1/3 (lg:col-span-1 in 3-column grid)
  const gridCols = sidebarWidth === 'narrow' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  const sidebarCols = 'lg:col-span-1'
  const mainCols = sidebarWidth === 'narrow' ? 'lg:col-span-3' : 'lg:col-span-2'

  return (
    <div className={`grid grid-cols-1 ${gridCols} ${gapStyles[gap]} ${className}`}>
      {/* サイドバー */}
      <aside className={`${sidebarCols} lg:sticky lg:top-8 h-fit`}>
        {sidebar}
      </aside>

      {/* メインコンテンツエリア */}
      <div className={mainCols}>
        {children}
      </div>
    </div>
  )
}

