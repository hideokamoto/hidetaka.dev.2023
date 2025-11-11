import Link from 'next/link'
import { removeHtmlTags } from '@/lib/sanitize'
import type { FeedItem } from '@/libs/dataSources/types'

function formatDate(dateString: string, lang: string): string {
  return new Date(`${dateString}`).toLocaleDateString(lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative flex flex-col items-start ${className}`}>
      {children}
    </div>
  )
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
  as?: keyof JSX.IntrinsicElements
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
  return (
    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  )
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

export default function BlogPosts({ lang, posts }: { lang: string; posts: FeedItem[] }) {
  return (
    <div className="flex flex-col gap-16">
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {posts.map((article) => (
            <article key={article.href} className="md:grid md:grid-cols-4 md:items-baseline">
              <Card className="md:col-span-3">
                <CardTitle href={article.href}>{article.title}</CardTitle>
                <CardEyebrow
                  as="time"
                  dateTime={article.datetime}
                  className="md:hidden"
                  decorate
                >
                  {formatDate(article.datetime, lang)}
                </CardEyebrow>
                <CardEyebrow decorate>
                  <a href={article.dataSource.href} target="_blank" rel="noopener noreferrer">
                    {article.dataSource.name}
                  </a>
                </CardEyebrow>
                <CardDescription>{removeHtmlTags(article.description)}</CardDescription>
                <CardCta>Read article</CardCta>
              </Card>
              <CardEyebrow
                as="time"
                dateTime={article.datetime}
                className="mt-1 hidden md:block"
              >
                {formatDate(article.datetime, lang)}
              </CardEyebrow>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
