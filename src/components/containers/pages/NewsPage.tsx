import Link from 'next/link'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import type { BlogItem } from '@/libs/dataSources/types'

type NewsPageProps = {
  lang: string
  products: BlogItem[]
}

export default function NewsPageContent({ lang, products }: NewsPageProps) {
  const title = lang === 'ja' ? 'ニュース' : 'News'
  const description =
    lang === 'ja'
      ? 'プロジェクトや製品のリリース情報、アップデートなどのお知らせを掲載しています。'
      : 'Product releases, updates, and announcements for my projects and libraries.'

  return (
    <section className="mx-auto max-w-[1440px] px-8 sm:px-16 pt-12 pb-20">
      <PageHeader eyebrow="NEWS" title={title} sub={description} />

      {products.length > 0 ? (
        <div>
          {products.map((item, i) => {
            const date = new Date(item.datetime)
            return (
              <Link key={item.id || item.href} href={item.href} className="ds-entry">
                <span className="ds-entry__no">{String(i + 1).padStart(3, '0')}</span>
                <div>
                  <p className="ds-entry__title">{item.title}</p>
                  {item.description && (
                    <p className="ds-entry__meta">
                      {item.description.length > 120
                        ? `${item.description.substring(0, 120)}…`
                        : item.description}
                    </p>
                  )}
                </div>
                <DateDisplay date={date} lang={lang} format="short" className="ds-entry__date" />
              </Link>
            )
          })}
        </div>
      ) : (
        <p
          style={{
            color: 'var(--color-muted)',
            padding: '3rem 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {lang === 'ja' ? '製品ニュースが見つかりませんでした。' : 'No product news found.'}
        </p>
      )}
    </section>
  )
}
