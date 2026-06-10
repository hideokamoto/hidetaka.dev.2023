import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config'
import type { WPThought } from './dataSources/types'
import type { MicroCMSProjectsRecord } from './microCMS/types'
import { removeHtmlTags } from './sanitize'
import { changeLanguageURL, getLanguageFromURL } from './urlUtils/lang.util'

const MAX_DESCRIPTION_LENGTH = 120

type SupportedLang = 'en' | 'ja'

/**
 * パスを絶対URLに変換する。
 * 末尾スラッシュを正規化し、ルート（`/`）の場合はサイトURLそのものを返す。
 */
const toAbsoluteUrl = (path: string): string => {
  const normalized = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
  return normalized === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${normalized}`
}

/**
 * 言語コードからOpen Graphのlocale値を返す。
 */
export function getOpenGraphLocale(lang: SupportedLang): 'en_US' | 'ja_JP' {
  return lang === 'ja' ? 'ja_JP' : 'en_US'
}

export type BuildAlternatesOptions = {
  /**
   * canonicalを特定の言語側へ正規化する場合に指定する。
   * 省略時は渡されたパス自身がcanonicalになる。
   * （例: dev-notesはen/jaで同一の日本語コンテンツのため'ja'へ正規化する）
   */
  canonicalLang?: SupportedLang
  /**
   * ページが存在する言語。片方の言語にしか存在しないページでは
   * 存在しない言語へのhreflangを出力しないために指定する。
   * 省略時は en/ja の両方が存在するものとして扱う。
   */
  availableLanguages?: SupportedLang[]
}

/**
 * パスからcanonical + hreflang（en/ja/x-default）のalternatesを生成する。
 * en/jaパスの相互変換は `/ja` プレフィックスの付与/除去で行う。
 */
export function buildAlternates(
  path: string,
  options: BuildAlternatesOptions = {},
): NonNullable<Metadata['alternates']> {
  const enPath = changeLanguageURL(path, 'en')
  const jaPath = changeLanguageURL(path, 'ja')
  const available = options.availableLanguages ?? ['en', 'ja']
  const canonicalPath =
    options.canonicalLang === 'ja' ? jaPath : options.canonicalLang === 'en' ? enPath : path

  const languages: Partial<Record<'en' | 'ja' | 'x-default', string>> = {}
  if (available.includes('en')) {
    languages.en = toAbsoluteUrl(enPath)
  }
  if (available.includes('ja')) {
    languages.ja = toAbsoluteUrl(jaPath)
  }
  // x-defaultは英語版があれば英語版、なければ日本語版を指す
  languages['x-default'] = toAbsoluteUrl(available.includes('en') ? enPath : jaPath)

  return {
    canonical: toAbsoluteUrl(canonicalPath),
    languages,
  }
}

/**
 * WordPressのexcerpt/contentからmeta description用のプレーンテキストを生成する。
 * HTMLタグを除去し、空白を正規化したうえで最大120文字程度に切り詰める。
 * excerpt・contentが空の場合はtitleにフォールバックし、空文字を返さない。
 */
function buildDescription(thought: WPThought): string {
  const candidates = [thought.excerpt?.rendered, thought.content?.rendered, thought.title.rendered]

  for (const candidate of candidates) {
    const text = (removeHtmlTags(candidate ?? '') ?? '').replace(/\s+/g, ' ').trim()
    if (!text) continue

    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      return text
    }
    return `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}...`
  }

  return thought.title.rendered
}

export function generateDevNoteMetadata(note: WPThought, path: string): Metadata {
  const ogImageUrl = new URL(
    `/api/thumbnail/dev-notes/${note.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  const description = buildDescription(note)
  const lang = getLanguageFromURL(path)
  // dev-notesはen/jaで同一の日本語コンテンツを返すため、canonicalはja側へ正規化する
  const alternates = buildAlternates(path, { canonicalLang: 'ja' })

  return {
    title: note.title.rendered,
    description,
    alternates,
    openGraph: {
      title: note.title.rendered,
      description,
      type: 'article',
      publishedTime: note.date,
      url: toAbsoluteUrl(changeLanguageURL(path, 'ja')),
      siteName: SITE_CONFIG.name,
      locale: getOpenGraphLocale(lang),
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: note.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title.rendered,
      description,
      images: [ogImageUrl.toString()],
    },
  }
}

export function generateBlogPostMetadata(
  thought: WPThought,
  path: string,
  alternatesOptions: BuildAlternatesOptions = {},
): Metadata {
  // セキュリティ強化: post_idからWordPress APIで記事を取得してタイトルを使用
  // これにより、任意の文字列で画像を生成することを防止
  const ogImageUrl = new URL(
    `/api/thumbnail/thoughts/${thought.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  const description = buildDescription(thought)
  const lang = getLanguageFromURL(path)

  return {
    title: thought.title.rendered,
    description,
    alternates: buildAlternates(path, alternatesOptions),
    openGraph: {
      title: thought.title.rendered,
      description,
      type: 'article',
      publishedTime: thought.date,
      url: toAbsoluteUrl(path),
      siteName: SITE_CONFIG.name,
      locale: getOpenGraphLocale(lang),
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: thought.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: thought.title.rendered,
      description,
      images: [ogImageUrl.toString()],
    },
  }
}

const PROJECT_DESCRIPTION_MAX_LENGTH = 120

export function generateProjectMetadata(
  project: MicroCMSProjectsRecord,
  lang: SupportedLang,
): Metadata {
  const path = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`
  // aboutからHTMLタグを除去し、空白を正規化して説明文を生成する
  // aboutが無ければtitleをフォールバックとして使用する
  const rawDescription = project.about
    ? project.about
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  const baseDescription = rawDescription.length > 0 ? rawDescription : project.title
  const description =
    baseDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH
      ? baseDescription.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH)
      : baseDescription

  return {
    title: project.title,
    description,
    alternates: buildAlternates(path),
    openGraph: {
      title: project.title,
      description,
      type: 'website',
      url: toAbsoluteUrl(path),
      siteName: SITE_CONFIG.name,
      locale: getOpenGraphLocale(lang),
      ...(project.image
        ? {
            images: [
              {
                url: project.image.url,
                width: project.image.width,
                height: project.image.height,
                alt: project.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      ...(project.image ? { images: [project.image.url] } : {}),
    },
  }
}
