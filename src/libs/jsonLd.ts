import type { WPThought, BlogItem } from './dataSources/types'

const SITE_URL = 'https://hidetaka.dev'
const AUTHOR_NAME = 'Hidetaka Okamoto'
const SITE_NAME = 'Hidetaka.dev'

/**
 * ブログ詳細ページ用のBlogPosting JSON-LDを生成
 */
export function generateBlogPostingJsonLd(
  thought: WPThought,
  lang: string,
  basePath: string
) {
  const fullUrl = `${SITE_URL}${basePath}/${thought.slug}`

  // HTMLタグを除去してプレーンテキストに変換
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  const description = stripHtml(thought.excerpt.rendered)

  // カテゴリ情報を取得
  const categories = thought._embedded?.['wp:term']
    ?.flat()
    .filter((term) => term.taxonomy === 'category')
    .map((cat) => cat.name) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: thought.title.rendered,
    description: description,
    url: fullUrl,
    datePublished: thought.date,
    dateModified: thought.date,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    inLanguage: lang === 'ja' ? 'ja-JP' : 'en-US',
    ...(categories.length > 0 && {
      keywords: categories.join(', '),
      articleSection: categories,
    }),
  }

  return jsonLd
}

/**
 * ブログ詳細ページ用のBreadcrumbList JSON-LDを生成
 */
export function generateBlogBreadcrumbJsonLd(
  thought: WPThought,
  lang: string,
  basePath: string
) {
  const blogLabel = lang === 'ja' ? 'ブログ' : 'Blog'
  const fullUrl = `${SITE_URL}${basePath}/${thought.slug}`
  const blogUrl = `${SITE_URL}${basePath}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: blogLabel,
        item: blogUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: thought.title.rendered,
        item: fullUrl,
      },
    ],
  }

  return jsonLd
}

/**
 * ブログ一覧ページ用のCollectionPage + ItemList JSON-LDを生成
 */
export function generateBlogListJsonLd(
  thoughts: BlogItem[],
  lang: string,
  basePath: string,
  currentPage: number,
  totalPages: number,
  categoryName?: string
) {
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

  const fullUrl =
    currentPage > 1
      ? `${SITE_URL}${basePath}/page/${currentPage}`
      : `${SITE_URL}${basePath}`

  const itemListElements = thoughts.map((item, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1,
    url: `${SITE_URL}${item.href}`,
    name: item.title,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: fullUrl,
    inLanguage: lang === 'ja' ? 'ja-JP' : 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: thoughts.length,
      itemListElement: itemListElements,
    },
  }

  return jsonLd
}
