import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import type { WPEvent } from '@/libs/dataSources/types'

interface SpeakingDetailSidebarProps {
  lang: string
  previousReport?: WPEvent | null
  nextReport?: WPEvent | null
  className?: string
}

export default function SpeakingDetailSidebar({
  lang,
  previousReport,
  nextReport,
  className = '',
}: SpeakingDetailSidebarProps) {
  const previousLabel = lang === 'ja' ? '前のレポート' : 'Previous Report'
  const nextLabel = lang === 'ja' ? '次のレポート' : 'Next Report'
  const backLabel = lang === 'ja' ? '登壇レポート一覧に戻る' : 'Back to Event Reports'

  return (
    <div className={`hidden lg:block space-y-8 ${className}`}>
      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 前後のレポートナビゲーション */}
      {(previousReport || nextReport) && (
        <nav className="space-y-4">
          {/* 次のレポート */}
          {nextReport && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {nextLabel}
              </h3>
              <Link
                href={`${lang === 'ja' ? '/ja' : ''}/event-reports/${nextReport.slug}`}
                className="block p-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors line-clamp-2"
              >
                {nextReport.title.rendered}
              </Link>
            </div>
          )}

          {/* 前のレポート */}
          {previousReport && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {previousLabel}
              </h3>
              <Link
                href={`${lang === 'ja' ? '/ja' : ''}/event-reports/${previousReport.slug}`}
                className="block p-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors line-clamp-2"
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
        className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  )
}
