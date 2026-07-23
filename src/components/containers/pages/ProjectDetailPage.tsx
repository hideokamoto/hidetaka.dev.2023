import Image from 'next/image'
import Container from '@/components/tailwindui/Container'
import PageShell from '@/components/ui/PageShell'
import ProfileCard from '@/components/ui/ProfileCard'
import ProjectDetailSidebar from '@/components/ui/ProjectDetailSidebar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

type ProjectDetailPageProps = {
  project: MicroCMSProjectsRecord
  lang: 'ja' | 'en'
  /** 一覧ページへのパス（例: /work, /ja/projects） */
  basePath: string
  /** 一覧のラベル（例: Work, Projects） */
  sectionLabel: string
}

type BadgeTone = 'tint' | 'outline' | 'success'

function Badge({ children, tone = 'outline' }: { children: React.ReactNode; tone?: BadgeTone }) {
  const toneStyle: Record<BadgeTone, React.CSSProperties> = {
    tint: {
      background: 'color-mix(in oklch, var(--rvt-accent) 14%, transparent)',
      color: 'var(--rvt-accent)',
      border: '1px solid color-mix(in oklch, var(--rvt-accent) 30%, transparent)',
    },
    outline: { border: '1px solid var(--rvt-border)', color: 'var(--rvt-fg2)' },
    success: {
      background: 'color-mix(in oklch, var(--success) 14%, transparent)',
      color: 'var(--success)',
      border: '1px solid color-mix(in oklch, var(--success) 30%, transparent)',
    },
  }
  return (
    <span
      className="rounded-md px-2.5 py-1 text-xs font-medium"
      style={{ fontFamily: 'var(--rvt-font-mono)', ...toneStyle[tone] }}
    >
      {children}
    </span>
  )
}

function ProseSection({ heading, html }: { heading: string; html: string }) {
  return (
    <section
      className="mt-12 border-t pt-10 first:mt-0 first:border-t-0 first:pt-0"
      style={{ borderColor: 'var(--rvt-border)' }}
    >
      <h2
        className="mb-5 text-xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
      >
        {heading}
      </h2>
      <div
        className="blog-content leading-relaxed"
        style={{ color: 'var(--rvt-fg2)' }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted microCMS, controlled by site owner
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}

/**
 * ツール / 制作物（ストック）詳細ページ。
 * Revtrona Design System の ToolDetail（2カラム + サイドバー）に準拠。
 */
export default function ProjectDetailPage({
  project,
  lang,
  basePath,
  sectionLabel,
}: ProjectDetailPageProps) {
  const homeLabel = lang === 'ja' ? 'ホーム' : 'Home'
  const backgroundLabel = lang === 'ja' ? '背景' : 'Background'
  const architectureLabel = lang === 'ja' ? 'アーキテクチャ' : 'Architecture'
  const visitLabel = lang === 'ja' ? 'サイト・リポジトリを見る' : 'Visit site / repository'

  const background = typeof project.background === 'string' ? project.background : ''
  const architecture = typeof project.architecture === 'string' ? project.architecture : ''

  return (
    <Container className="mt-16 sm:mt-32">
      {/* ヘッダー（パンくず + タイトル + 概要） */}
      <PageShell
        breadcrumb={[
          { label: homeLabel, href: lang === 'ja' ? '/ja' : '/' },
          { label: sectionLabel, href: basePath },
          { label: project.title },
        ]}
        title={project.title}
        description={project.about ? project.about.replace(/<[^>]*>/g, '') : undefined}
      />

      <SidebarLayout
        sidebar={
          <ProjectDetailSidebar
            project={project}
            lang={lang}
            basePath={basePath}
            sectionLabel={sectionLabel}
          />
        }
        sidebarWidth="narrow"
        gap="lg"
      >
        <article>
          {/* バッジ */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {project.project_type.map((type) => (
              <Badge key={type} tone="tint">
                {type}
              </Badge>
            ))}
            {project.status && <Badge tone="success">{project.status}</Badge>}
          </div>

          {/* イメージ */}
          {project.image && (
            <div
              className="mb-10 overflow-hidden rounded-2xl"
              style={{ border: '1px solid var(--rvt-border)' }}
            >
              <Image
                src={project.image.url}
                alt={project.title}
                width={project.image.width}
                height={project.image.height}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* 本文セクション */}
          {background && <ProseSection heading={backgroundLabel} html={background} />}
          {architecture && <ProseSection heading={architectureLabel} html={architecture} />}

          {/* モバイル向け CTA / プロフィール */}
          <div className="mt-12 space-y-8 lg:hidden">
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
            <ProfileCard lang={lang} imageSrc="/images/profile.jpg" />
          </div>
        </article>
      </SidebarLayout>
    </Container>
  )
}
