import { SITE_CONFIG } from '@/config'
import { getActionButtonStyles } from '@/libs/componentStyles.utils'
import { cn } from '@/libs/utils/cn'

/**
 * Props for the ViewMarkdownButton component
 */
type ViewMarkdownButtonProps = {
  /** The slug of the article (used to construct the markdown filename) */
  slug: string
  /** The base path for the markdown file (e.g., 'posts', 'news', 'dev-notes') */
  basePath: string
  /** The title of the article (used in the link's title attribute for accessibility) */
  title: string
  /** The language code (e.g., 'ja', 'en') - determines button text language */
  language: string
  /** Optional additional CSS classes to apply to the wrapper div */
  className?: string
}

/**
 * A reusable button component that links to the Markdown version of an article.
 *
 * This component renders a styled button that opens the raw Markdown file in a new tab.
 * It supports bilingual text (Japanese/English) and matches the styling of CTAButton
 * with the secondary variant.
 *
 * @param props - The component props
 * @param props.slug - The article slug used to construct the markdown filename
 * @param props.basePath - The base path for the markdown file location
 * @param props.title - The article title for accessibility
 * @param props.language - The language code to determine button text
 * @param props.className - Optional additional CSS classes
 *
 * @returns A styled anchor element wrapped in a div with spacing and borders
 *
 * @example
 * ```tsx
 * <ViewMarkdownButton
 *   slug="my-article"
 *   basePath="posts"
 *   title="My Article Title"
 *   language="ja"
 * />
 * ```
 */
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
  const buttonStyles = getActionButtonStyles('secondary')

  return (
    <a
      href={markdownUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${buttonText}: ${title}`}
      className={cn(buttonStyles, className)}
    >
      {buttonText}
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </a>
  )
}
