import Link from 'next/link'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`group relative flex flex-col items-start ${className}`}>{children}</div>
}

function CardTitle({ href, children }: { href?: string; children: React.ReactNode }) {
  const Component = href ? Link : 'h2'
  return (
    <Component
      href={href || '#'}
      className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
    >
      {children}
    </Component>
  )
}

function CardEyebrow({
  as: Component = 'p',
  children,
  className = '',
  decorate,
  ...props
}: {
  as?: keyof React.JSX.IntrinsicElements
  children: React.ReactNode
  className?: string
  decorate?: boolean
  [key: string]: any
}) {
  return (
    <Component
      className={`relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 ${
        decorate ? 'pl-3.5' : ''
      } ${className}`}
      {...props}
    >
      {decorate && (
        <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
          <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        </span>
      )}
      {children}
    </Component>
  )
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">{children}</p>
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.75 5.75 9.25 8l-2.5 2.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CardCta({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500"
    >
      {children}
      <ChevronRightIcon className="ml-1 h-4 w-4 stroke-current" />
    </div>
  )
}

export default function ProjectCard({
  project,
  lang,
}: {
  project: MicroCMSProjectsRecord
  lang: string
}) {
  const href = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <CardTitle href={href}>{project.title}</CardTitle>
        {project.published_at && (
          <CardEyebrow as="time" dateTime={project.published_at} className="md:hidden" decorate>
            {new Date(project.published_at).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </CardEyebrow>
        )}
        {project.about && (
          <CardDescription>
            {project.about.replace(/<[^>]*>/g, '').substring(0, 200)}
            {project.about.replace(/<[^>]*>/g, '').length > 200 ? '...' : ''}
          </CardDescription>
        )}
        <CardCta>Read more</CardCta>
      </Card>
      {project.published_at && (
        <CardEyebrow as="time" dateTime={project.published_at} className="mt-1 hidden md:block">
          {new Date(project.published_at).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </CardEyebrow>
      )}
    </article>
  )
}
