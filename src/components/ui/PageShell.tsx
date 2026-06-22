import Link from 'next/link'

export type Breadcrumb = {
  label: string
  href?: string
}

type PageShellProps = {
  breadcrumb: Breadcrumb[]
  title: string
  description?: string
  className?: string
}

/**
 * 詳細ページ共通のヘッダー（パンくず + 大見出し + 説明）。
 * Revtrona Design System の website UI kit（PageShell）に準拠。
 */
export default function PageShell({
  breadcrumb,
  title,
  description,
  className = '',
}: PageShellProps) {
  return (
    <header
      className={`mb-12 border-b pb-10 ${className}`}
      style={{ borderColor: 'var(--rvt-border)' }}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex flex-wrap items-center gap-2 text-[11px] tracking-wide"
        style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg3)' }}
      >
        {breadcrumb.map((item, i) => (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span style={{ color: 'var(--rvt-fg3)' }}>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="text-[var(--rvt-fg3)] transition-colors hover:text-[var(--rvt-fg2)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="line-clamp-1" style={{ color: 'var(--rvt-fg2)' }}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <h1
        className="text-balance text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl"
        style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
      >
        {title}
      </h1>

      {description && (
        <p
          className="mt-4 max-w-[620px] text-base font-light leading-8"
          style={{ color: 'var(--rvt-fg2)' }}
        >
          {description}
        </p>
      )}
    </header>
  )
}
