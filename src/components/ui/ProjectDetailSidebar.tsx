import Link from 'next/link'
import ProfileCard from '@/components/ui/ProfileCard'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

type ProjectDetailSidebarProps = {
  project: MicroCMSProjectsRecord
  lang: 'ja' | 'en'
  basePath: string
  sectionLabel: string
  className?: string
}

/**
 * ツール / 制作物（ストック）詳細ページのサイドバー。
 * Revtrona Design System の ToolDetail サイドバーに準拠（CTA / タグ / 著者 / 戻る）。
 */
export default function ProjectDetailSidebar({
  project,
  lang,
  basePath,
  sectionLabel,
  className = '',
}: ProjectDetailSidebarProps) {
  const tagsLabel = lang === 'ja' ? 'タグ' : 'Tags'
  const visitLabel = lang === 'ja' ? 'サイト・リポジトリを見る' : 'Visit site / repository'
  const backLabel = lang === 'ja' ? `${sectionLabel}一覧に戻る` : `Back to ${sectionLabel}`

  return (
    <div className={`hidden lg:block lg:space-y-7 ${className}`}>
      {/* CTA */}
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
          style={{
            fontFamily: 'var(--rvt-font-display)',
            background: 'var(--rvt-accent)',
            boxShadow: 'var(--rvt-shadow-cta)',
          }}
        >
          {visitLabel}
        </a>
      )}

      {/* 概要ボックス */}
      {project.about && (
        <div
          className="rounded-2xl p-5"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
          <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--rvt-fg2)' }}>
            {project.about.replace(/<[^>]*>/g, '')}
          </p>
        </div>
      )}

      {/* タグ */}
      {project.tags.length > 0 && (
        <div>
          <h3
            className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]"
            style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg3)' }}
          >
            {tagsLabel}
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md px-2.5 py-1 text-xs"
                style={{
                  fontFamily: 'var(--rvt-font-mono)',
                  border: '1px solid var(--rvt-border)',
                  color: 'var(--rvt-fg2)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* プロフィールカード */}
      <ProfileCard lang={lang} imageSrc="/images/profile.jpg" imageSize="responsive" />

      {/* 一覧に戻る */}
      <Link
        href={basePath}
        aria-label={backLabel}
        className="block text-sm font-medium text-[var(--rvt-fg2)] transition-colors hover:text-[var(--rvt-fg)]"
      >
        ← {backLabel}
      </Link>
    </div>
  )
}
