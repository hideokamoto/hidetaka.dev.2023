import ArticleSummary from '@/components/ui/ArticleSummary'
import BlogTranslation from '@/components/ui/BlogTranslation'
import ViewMarkdownButton from '@/components/ui/ViewMarkdownButton'
import { getActionButtonStyles } from '@/libs/componentStyles.utils'
import { cn } from '@/libs/utils/cn'
import { DETAIL_PAGE_SECTION_CLASS } from '@/libs/utils/detailPageStyles'

type ArticleActionsProps = {
  lang: string
  slug: string
  basePath: string
  title: string
  contentHtml: string
  showTranslation?: boolean
  translationContentSelector?: string
  className?: string
}

export default function ArticleActions({
  lang,
  slug,
  basePath,
  title,
  contentHtml,
  showTranslation = false,
  translationContentSelector = 'article',
  className,
}: ArticleActionsProps) {
  const isJa = lang.startsWith('ja')
  const summaryLabel = isJa ? 'この記事の操作' : 'Article actions'

  return (
    <section className={cn(DETAIL_PAGE_SECTION_CLASS, className)} aria-label={summaryLabel}>
      {/* 
        スマホ: <details>でドロップダウン
        PC: summaryを隠し、アクションは常時表示（UAのdisplay:noneは詳細度の高いセレクタで上書き）
      */}
      <details className="group">
        <summary
          className={cn(
            getActionButtonStyles('secondary'),
            '[&::-webkit-details-marker]:hidden justify-between sm:hidden',
          )}
        >
          <span>{summaryLabel}</span>
          <svg
            className="size-4 shrink-0 transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </summary>

        <div className="mt-3 flex flex-col gap-3 sm:mt-0 sm:flex sm:flex-row sm:flex-wrap sm:items-start sm:[details:not([open])_>_&]:flex">
          <ViewMarkdownButton slug={slug} basePath={basePath} title={title} language={lang} />
          <ArticleSummary content={contentHtml} locale={lang} />
          {showTranslation && (
            <BlogTranslation locale={lang} contentSelector={translationContentSelector} />
          )}
        </div>
      </details>
    </section>
  )
}
