type SectionHeaderProps = {
  no?: string
  title: string
  titleSub?: string
  action?: React.ReactNode
  description?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function SectionHeader({
  no,
  title,
  titleSub,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <header className={`ds-sec-header ${className}`}>
      {no && <div className="ds-sec-header__no">{no}</div>}
      <h2 className="ds-sec-header__title">
        {title}
        {titleSub && <small>{titleSub}</small>}
      </h2>
      {action && <div className="ds-sec-header__action">{action}</div>}
    </header>
  )
}
