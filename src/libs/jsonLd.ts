import { SITE_CONFIG } from '@/config'
import type { BlogItem, WPThought } from './dataSources/types'
import type { Profile } from './profile/types'
import { removeHtmlTags } from './sanitize'

/**
 * 勤務先のURLを解決する。
 *
 * 上流の JSON Resume は `work[]` に組織名しか持たず、JSON-LD の `worksFor` にもURLは出ない
 * （`work[].url` はスキーマ上存在するが未使用）。URLは `SITE_CONFIG` にしかないため、
 * **組織名が一致するときに限り**それを補う。名前が一致しない＝転職しているということなので、
 * 新しい勤務先に前職のURLを貼り付けないための条件。上流が `work[].url` を持てば不要になる。
 */
function resolveOrgUrl(org: Profile['worksFor']): string | undefined {
  if (org?.url) return org.url
  if (org?.name === SITE_CONFIG.author.worksFor.name) return SITE_CONFIG.author.worksFor.url
  return undefined
}

/** `generatePersonJsonLd()` が返す Schema.org Person オブジェクトの形。 */
export type PersonJsonLd = {
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: string
  alternateName?: string
  url: string
  image: string
  jobTitle?: string
  description?: string
  worksFor?: { '@type': 'Organization'; name: string; url?: string }
  sameAs?: string[]
  knowsAbout?: string[]
  award?: string[]
}

/**
 * サイト著者用のPerson JSON-LDを生成
 *
 * 職歴・肩書き・専門領域・ソーシャルリンクは profile-as-a-service（`profile`）から取る。
 * 以前はここで手書きしていたため、`knowsAbout` が3件のまま実態と乖離していた。
 *
 * 一方で **url / image はサイト側が保持する**。上流の `url` は
 * profile-as-a-service 上の正規URL（CloudFront）を指しており、hidetaka.dev の Person
 * ノードの正規URLとしてそれを使うと、この人物の代表URLがCDNドメインになってしまう。
 * 画像も同様に、サイトが用意したプロフィール写真を使い続ける。
 *
 * `description` は外部（profile-as-a-service）由来なので、他の外部コンテンツ
 * （`generateBlogPostingJsonLd` 等）と同じ `removeHtmlTags()` を通してからJSON-LDへ入れる。
 *
 * @param profile 表示言語（ルートレイアウトは `lang="en"`）のプロフィール
 * @param alternateName 別言語での氏名。日本語名を `alternateName` として併記するために使う
 */
export function generatePersonJsonLd(profile: Profile, alternateName?: string): PersonJsonLd {
  // 上流の sameAs には `basics.url`（= https://hidetaka.dev）が含まれる。この Person ノード
  // 自身のURLなので、`url` と重複させず sameAs からは落とす。プロトコル・大文字小文字・末尾
  // スラッシュの表記ゆれを吸収するため URL オブジェクトで正規化してから比較する。
  const siteUrl = new URL(SITE_CONFIG.url)
  const sameAs = profile.sameAs.filter((url) => {
    try {
      const parsed = new URL(url)
      return !(
        parsed.hostname.toLowerCase() === siteUrl.hostname.toLowerCase() &&
        parsed.pathname.replace(/\/+$/, '') === siteUrl.pathname.replace(/\/+$/, '')
      )
    } catch {
      return true
    }
  })

  const description = profile.description ? removeHtmlTags(profile.description).trim() : undefined

  const jsonLd: PersonJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    ...(alternateName ? { alternateName } : {}),
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.author.image}`,
    ...(profile.jobTitle ? { jobTitle: profile.jobTitle } : {}),
    ...(description ? { description } : {}),
    ...(profile.worksFor
      ? {
          worksFor: {
            '@type': 'Organization',
            name: profile.worksFor.name,
            ...(resolveOrgUrl(profile.worksFor) ? { url: resolveOrgUrl(profile.worksFor) } : {}),
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(profile.knowsAbout.length > 0 ? { knowsAbout: profile.knowsAbout } : {}),
    ...(profile.awards.length > 0 ? { award: profile.awards } : {}),
  }

  return jsonLd
}

/**
 * ブログ詳細ページ用のBlogPosting JSON-LDを生成
 */
export function generateBlogPostingJsonLd(thought: WPThought, lang: string, basePath: string) {
  const fullUrl = `${SITE_CONFIG.url}${basePath}/${thought.slug}`

  const description = removeHtmlTags(thought.excerpt.rendered).trim()

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

  const description = removeHtmlTags(note.excerpt.rendered).trim()

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
