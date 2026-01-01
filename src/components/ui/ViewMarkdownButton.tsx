import { SITE_CONFIG } from '@/config'

type ViewMarkdownButtonProps = {
  slug: string
  basePath: string
  title: string
  language: string
  className?: string
}

export default function ViewMarkdownButton({
  slug,
  basePath,
  title,
  language,
  className = '',
}: ViewMarkdownButtonProps) {
  const isJapanese = language.startsWith('ja')
  const buttonText = isJapanese ? 'Markdownで見る' : 'View in Markdown'

  // Construct the markdown URL
  const markdownUrl = new URL(`${basePath}/${slug}.md`, SITE_CONFIG.url).toString()

  // Base styles matching CTAButton
  const baseStyles =
    'group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl'

  // Secondary variant styles matching CTAButton
  const secondaryStyles =
    'border border-zinc-200 bg-white text-zinc-900 shadow-zinc-500/20 hover:bg-zinc-50 hover:shadow-zinc-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'

  return (
    <div className={`mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700 ${className}`}>
      <a
        href={markdownUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${buttonText}: ${title}`}
        className={`${baseStyles} ${secondaryStyles}`}
      >
        {buttonText}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
    </div>
  )
}
