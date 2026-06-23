import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPProduct } from '@/libs/dataSources/products'

interface NewsDetailSidebarProps {
  lang: 'ja' | 'en'
  basePath: string
  previousProduct?: WPProduct | null
  nextProduct?: WPProduct | null
  className?: string
}

export default function NewsDetailSidebar({
  lang,
  basePath,
  previousProduct,
  nextProduct,
  className = '',
}: NewsDetailSidebarProps) {
  const previousLabel = lang === 'ja' ? '前の記事' : 'Previous Article'
  const nextLabel = lang === 'ja' ? '次の記事' : 'Next Article'
  const backLabel = lang === 'ja' ? 'ニュースに戻る' : 'Back to News'

  return (
    <div className={`hidden lg:block space-y-8 ${className}`}>
      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 前後の記事ナビゲーション */}
      {(previousProduct || nextProduct) && (
        <nav className="space-y-4">
          {/* 次の記事 */}
          {nextProduct && (
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--rvt-fg)' }}>
                {nextLabel}
              </h3>
              <Link
                href={`${basePath}/${nextProduct.slug}`}
                className="block text-sm text-indigo-600 hover:text-indigo-700 transition-colors line-clamp-2"
              >
                {nextProduct.title.rendered}
              </Link>
            </div>
          )}

          {/* 前の記事 */}
          {previousProduct && (
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--rvt-fg)' }}>
                {previousLabel}
              </h3>
              <Link
                href={`${basePath}/${previousProduct.slug}`}
                className="block text-sm text-indigo-600 hover:text-indigo-700 transition-colors line-clamp-2"
              >
                {previousProduct.title.rendered}
              </Link>
            </div>
          )}
        </nav>
      )}

      {/* ニュースに戻るリンク */}
      <Link
        href={basePath}
        className="inline-flex items-center text-sm font-medium text-[var(--rvt-fg2)] hover:text-[var(--rvt-fg)] transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {backLabel}
      </Link>
    </div>
  )
}
