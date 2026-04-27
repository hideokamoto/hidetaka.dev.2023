import Link from 'next/link'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import type { CategoryWithCount } from '@/libs/dataSources/thoughts'
import type { BlogItem } from '@/libs/dataSources/types'

type BlogPageProps = {
  lang: string
  thoughts: BlogItem[]
  currentPage: number
  totalPages: number
  basePath: string
  categoryName?: string
  categories?: CategoryWithCount[]
}

function getPageContent(lang: string, categoryName?: string) {
  const title = categoryName
    ? lang === 'ja'
      ? `カテゴリ: ${categoryName}`
      : `Category: ${categoryName}`
    : lang === 'ja'
      ? 'ブログ'
      : 'Blog'

  const description = categoryName
    ? lang === 'ja'
      ? `「${categoryName}」カテゴリのブログ記事一覧です。`
      : `Blog posts in the "${categoryName}" category.`
    : lang === 'ja'
      ? '技術的ではないトピックを中心としたブログ記事を掲載しています。'
      : 'A collection of blog posts focusing on non-technical topics.'

  return { title, description }
}

export default function BlogPageContent({
  lang,
  thoughts,
  currentPage,
  totalPages,
  basePath,
  categoryName,
  categories = [],
}: BlogPageProps) {
  const { title, description } = getPageContent(lang, categoryName)

  const currentCategorySlug = categoryName
    ? categories.find((cat) => cat.name === categoryName)?.slug
    : undefined

  const blogBasePath = basePath.includes('/category/') ? basePath.split('/category/')[0] : basePath

  const categoryTitle = lang === 'ja' ? 'カテゴリ' : 'Categories'
  const allText = lang === 'ja' ? 'すべて' : 'All'

  return (
    <section className="mx-auto max-w-[1440px] px-8 sm:px-16 pt-12 pb-20">
      <PageHeader eyebrow="BLOG" title={title} sub={description} />

      {/* Category filter bar */}
      {categories.length > 0 && (
        <div className="ds-filter-bar">
          <span className="ds-filter-bar__label">{categoryTitle}</span>
          <Link
            href={blogBasePath}
            className="ds-tag"
            aria-pressed={!currentCategorySlug ? 'true' : 'false'}
          >
            {allText}
          </Link>
          {categories.map((category) => {
            const normalizedSlug = category.slug.includes('%')
              ? decodeURIComponent(category.slug)
              : category.slug
            const categoryUrl = `${blogBasePath}/category/${encodeURIComponent(normalizedSlug)}`
            const isActive =
              currentCategorySlug === category.slug || currentCategorySlug === normalizedSlug
            return (
              <Link
                key={category.id}
                href={categoryUrl}
                className="ds-tag"
                aria-pressed={isActive ? 'true' : 'false'}
              >
                {category.name}{' '}
                <small style={{ opacity: 0.6 }}>
                  {category.count > 20 ? '20+' : category.count}
                </small>
              </Link>
            )
          })}
        </div>
      )}

      {/* Entry list */}
      {thoughts.length > 0 ? (
        <>
          <div>
            {thoughts.map((item, i) => {
              const date = new Date(item.datetime)
              return (
                <Link key={item.id || item.href} href={item.href} className="ds-entry">
                  <span className="ds-entry__no">
                    {String(i + 1 + (currentPage - 1) * 10).padStart(3, '0')}
                  </span>
                  <div>
                    <p className="ds-entry__title">{item.title}</p>
                    {item.categories && item.categories.length > 0 && (
                      <p className="ds-entry__meta">
                        {item.categories.map((c) => c.name).join(' · ')}
                      </p>
                    )}
                    {item.description && (
                      <p className="ds-entry__meta">
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}…`
                          : item.description}
                      </p>
                    )}
                  </div>
                  <DateDisplay date={date} lang={lang} format="short" className="ds-entry__date" />
                </Link>
              )
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            lang={lang}
          />
        </>
      ) : (
        <div style={{ padding: '3rem 0' }}>
          {lang === 'ja' ? (
            <p
              style={{
                color: 'var(--color-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
              }}
            >
              記事が見つかりませんでした。
            </p>
          ) : (
            <div>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: '1rem',
                }}
              >
                No articles found in English.
              </p>
              <Link href="/ja/blog" className="ds-btn ds-btn--secondary ds-btn--sm">
                View Japanese Blog →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
