import { SITE_CONFIG } from '@/config'
import type { BlogItem, WPThought } from './dataSources/types'

/**
 * ブログ詳細ページ用のBlogPosting JSON-LDを生成
 */
export function generateBlogPostingJsonLd(thought: WPThought, lang: string, basePath: string) {
  const fullUrl = `${SITE_CONFIG.url}${basePath}/${thought.slug}`

  // HTMLタグを除去してプレーンテキストに変換
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  const description = stripHtml(thought.excerpt.rendered)

  // カテゴリ情報を取得
  const categories =
    thought._embedded?.['wp:term']
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
    dateModified: thought.modified,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
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
 * dev-notes詳細ページ用のBlogPosting JSON-LDを生成
 */
export function generateDevNoteJsonLd(note: WPThought, basePath: string) {
  const fullUrl = `${SITE_CONFIG.url}${basePath}/${note.slug}`

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  const description = stripHtml(note.excerpt.rendered)

  const categories =
    note._embedded?.['wp:term']
      ?.flat()
      .filter((term) => term.taxonomy === 'category')
      .map((cat) => cat.name) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: note.title.rendered,
    description: description,
    url: fullUrl,
    datePublished: note.date,
    dateModified: note.modified,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    inLanguage: 'ja-JP',
    ...(categories.length > 0 && {
      keywords: categories.join(', '),
      articleSection: categories,
    }),
  }

  return jsonLd
}

/**
 * dev-notes詳細ページ用のBreadcrumbList JSON-LDを生成
 */
export function generateDevNoteBreadcrumbJsonLd(note: WPThought, basePath: string) {
  const fullUrl = `${SITE_CONFIG.url}${basePath}/${note.slug}`
  const listUrl = `${SITE_CONFIG.url}/ja/writing`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Writing',
        item: listUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: note.title.rendered,
        item: fullUrl,
      },
    ],
  }

  return jsonLd
}

/**
 * ブログ詳細ページ用のBreadcrumbList JSON-LDを生成
 */
export function generateBlogBreadcrumbJsonLd(thought: WPThought, lang: string, basePath: string) {
  const blogLabel = lang === 'ja' ? 'ブログ' : 'Blog'
  const fullUrl = `${SITE_CONFIG.url}${basePath}/${thought.slug}`
  const blogUrl = `${SITE_CONFIG.url}${basePath}`

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
  _totalPages: number,
  categoryName?: string,
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
      ? `${SITE_CONFIG.url}${basePath}/page/${currentPage}`
      : `${SITE_CONFIG.url}${basePath}`

  const itemListElements = thoughts.map((item, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1,
    url: `${SITE_CONFIG.url}${item.href}`,
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
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: thoughts.length,
      itemListElement: itemListElements,
    },
  }

  return jsonLd
}
