import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPEvent } from '@/libs/dataSources/types'

interface SpeakingDetailSidebarProps {
  lang: 'ja' | 'en'
  basePath: string
  previousReport?: WPEvent | null
  nextReport?: WPEvent | null
  className?: string
}

export default function SpeakingDetailSidebar({
  lang,
  basePath,
  previousReport,
  nextReport,
  className = '',
}: SpeakingDetailSidebarProps) {
  const previousLabel = lang === 'ja' ? '前のレポート' : 'Previous Report'
  const nextLabel = lang === 'ja' ? '次のレポート' : 'Next Report'
  const backLabel = lang === 'ja' ? '登壇レポート一覧に戻る' : 'Back to Event Reports'

  return (
    <div className={`hidden lg:block lg:space-y-8 ${className}`}>
      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 前後のレポートナビゲーション */}
      {(previousReport || nextReport) && (
        <nav className="lg:space-y-4">
          {/* 次のレポート */}
          {nextReport && (
            <div>
              <h3
                className="lg:mb-2 lg:text-sm lg:font-semibold"
                style={{ color: 'var(--rvt-fg)' }}
              >
                {nextLabel}
              </h3>
              <Link
                href={`${basePath}/${nextReport.slug}`}
                aria-label={`${nextLabel}: ${nextReport.title.rendered}`}
                className="block lg:p-3 lg:text-sm lg:font-medium text-indigo-600 hover:text-indigo-700 lg:rounded-lg transition-colors line-clamp-2"
                style={{ background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)' }}
              >
                {nextReport.title.rendered}
              </Link>
            </div>
          )}

          {/* 前のレポート */}
          {previousReport && (
            <div>
              <h3
                className="lg:mb-2 lg:text-sm lg:font-semibold"
                style={{ color: 'var(--rvt-fg)' }}
              >
                {previousLabel}
              </h3>
              <Link
                href={`${basePath}/${previousReport.slug}`}
                aria-label={`${previousLabel}: ${previousReport.title.rendered}`}
                className="block lg:p-3 lg:text-sm lg:font-medium text-indigo-600 hover:text-indigo-700 lg:rounded-lg transition-colors line-clamp-2"
                style={{ background: 'color-mix(in oklch, var(--rvt-accent) 10%, transparent)' }}
              >
                {previousReport.title.rendered}
              </Link>
            </div>
          )}
        </nav>
      )}

      {/* 登壇レポート一覧に戻る */}
      <Link
        href={lang === 'ja' ? '/ja/speaking' : '/speaking'}
        aria-label={backLabel}
        className="block lg:text-sm lg:font-medium text-[var(--rvt-fg2)] hover:text-[var(--rvt-fg)] transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  )
}
