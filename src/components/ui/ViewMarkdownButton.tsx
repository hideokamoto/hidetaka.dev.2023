import { getCTAButtonStyles } from '@/libs/componentStyles.utils'
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

  // Get button styles from utility
  const buttonStyles = getCTAButtonStyles('secondary')
  const wrapperStyles = 'mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700'

  return (
    <div className={wrapperStyles + (className ? ` ${className}` : '')}>
      <a
        href={markdownUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${buttonText}: ${title}`}
        className={buttonStyles}
      >
        {buttonText}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
    </div>
  )
}
