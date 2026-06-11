import type { WPQueryValue } from 'node-wp-api-client'
import { logger } from '@/libs/logger'
import type { BlogItem, Category, WPThought } from './types'
import { wpClient } from './wpClient'

export type DevNotesResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

const devNotesCollection = () => wpClient.postType<WPThought>('dev-notes')

const DEV_NOTE_LIST_FIELDS = [
  '_links.wp:term',
  '_embedded',
  'id',
  'title',
  'date',
  'date_gmt',
  'excerpt',
  'slug',
  'link',
  'categories',
] as const

// _embedded.wp:term のみを参照する最小限の入力型
// （node-wp-api-client が _fields 指定で返す絞り込み型でも受け取れるようにするため）
type EmbeddedTermSource = {
  _embedded?: {
    'wp:term'?: ReadonlyArray<
      ReadonlyArray<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
}

// カテゴリ情報を抽出するヘルパー関数
// dev-notesのカスタム投稿タイプでは、カテゴリのタクソノミー名が異なる可能性があるため、
// すべてのタクソノミーからカテゴリを抽出する
// テスト可能にするためにexport
export const extractCategories = (note: EmbeddedTermSource): Category[] => {
  if (!note._embedded?.['wp:term']) {
    return []
  }

  const categories: Category[] = []
  for (const termArray of note._embedded['wp:term']) {
    for (const term of termArray) {
      // post_tag（タグ）は除外し、それ以外のすべてのタクソノミーをカテゴリとして扱う
      // これにより、カスタム投稿タイプのカスタムタクソノミーも含まれる
      if (term.taxonomy !== 'post_tag') {
        categories.push({
          id: term.id,
          name: term.name,
          slug: term.slug,
          taxonomy: term.taxonomy,
        })
      }
    }
  }

  return categories
}

/**
 * dev-notes投稿タイプの記事を取得
 * @param page - ページ番号（デフォルト: 1）
 * @param perPage - 1ページあたりの記事数（デフォルト: 20）
 * @param lang - 言語コード（'ja' または 'en'、デフォルト: 'ja'）
 * @returns DevNotesResult - dev-notes記事のリストとメタデータ
 */
export const loadDevNotes = async (
  page: number = 1,
  perPage: number = 20,
  lang: string = 'ja',
  after?: string,
): Promise<DevNotesResult> => {
  try {
    // after を渡すとその日時以降の記事のみ取得し、過剰なデータ取得を避ける
    const {
      items: notes,
      total: totalItems,
      totalPages,
    } = await devNotesCollection().list(
      {
        page,
        per_page: perPage,
        ...(after ? { after } : {}),
        _embed: 'wp:term',
        _fields: DEV_NOTE_LIST_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証（WordPress記事）
      },
    )

    const items: BlogItem[] = notes.map((note): BlogItem => {
      const basePath = lang === 'ja' ? '/ja/writing/dev-notes' : '/writing/dev-notes'
      const href = `${basePath}/${note.slug}`

      return {
        id: note.id.toString(),
        title: note.title.rendered,
        description: note.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: note.date,
        href,
        categories: extractCategories(note),
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    logger.error('Failed to load dev-notes', {
      error,
      page,
      perPage,
    })
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

/**
 * slugでdev-notes記事を取得
 */
export const getDevNoteBySlug = async (slug: string): Promise<WPThought | null> => {
  try {
    return await devNotesCollection().getBySlug(
      slug,
      {
        _embed: 'wp:term',
        _fields: [
          '_links.wp:term',
          '_embedded',
          'id',
          'title',
          'date',
          'date_gmt',
          'modified',
          'modified_gmt',
          'excerpt',
          'content',
          'slug',
          'link',
          'categories',
        ],
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )
  } catch (error) {
    logger.error('Failed to load dev-note by slug', {
      error,
      slug,
    })
    return null
  }
}

export type AdjacentDevNotes = {
  previous: Pick<WPThought, 'id' | 'title' | 'slug'> | null
  next: Pick<WPThought, 'id' | 'title' | 'slug'> | null
}

/**
 * 前後の記事を取得
 */
export const getAdjacentDevNotes = async (currentNote: WPThought): Promise<AdjacentDevNotes> => {
  try {
    const previousPromise = devNotesCollection().list(
      {
        before: currentNote.date,
        per_page: 1,
        orderby: 'date',
        order: 'desc',
        _fields: ['id', 'title', 'slug'],
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )
    const nextPromise = devNotesCollection().list(
      {
        after: currentNote.date,
        per_page: 1,
        orderby: 'date',
        order: 'asc',
        _fields: ['id', 'title', 'slug'],
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    const [previousResult, nextResult] = await Promise.all([previousPromise, nextPromise])

    // _fields で id/title/slug のみ取得しているため、型安全性のためPick型を経由してキャスト
    const previous =
      (previousResult.items[0] as Pick<WPThought, 'id' | 'title' | 'slug'> | undefined) ?? null
    const next =
      (nextResult.items[0] as Pick<WPThought, 'id' | 'title' | 'slug'> | undefined) ?? null
    return {
      previous,
      next,
    }
  } catch (error) {
    logger.error('Failed to load adjacent dev-notes', {
      error,
      noteId: currentNote.id,
    })
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * 関連記事を取得（同じカテゴリの記事からランダムに選択）
 * カテゴリがない場合は、すべてのdev-notes記事から選択
 * @param currentNote - 現在のdev-notes記事
 * @param limit - 取得する関連記事の最大数（デフォルト: 4）
 * @param lang - 言語コード（'ja' または 'en'、デフォルト: 'ja'）
 * @returns BlogItem[] - 関連dev-notes記事のリスト
 */
export const getRelatedDevNotes = async (
  currentNote: WPThought,
  limit: number = 4,
  lang: string = 'ja',
): Promise<BlogItem[]> => {
  try {
    const categories = extractCategories(currentNote)
    const fetchLimit = Math.max(limit * 2.5, 10)

    // カテゴリがある場合は同じカテゴリの記事を取得、ない場合はすべての記事を取得
    const taxonomyFilter: Record<string, WPQueryValue> = {}
    if (categories.length > 0) {
      const category = categories[0]
      // カスタム投稿タイプでは、カテゴリのタクソノミー名をパラメータとして使用
      // 例: categories (デフォルト) または dev-note-category (カスタム)
      const taxonomyParam = category.taxonomy === 'category' ? 'categories' : category.taxonomy
      taxonomyFilter[taxonomyParam] = category.id
    }

    const { items: notes } = await devNotesCollection().list(
      {
        ...taxonomyFilter,
        exclude: [currentNote.id],
        per_page: fetchLimit,
        _embed: 'wp:term',
        _fields: DEV_NOTE_LIST_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    const items: BlogItem[] = notes.map((note): BlogItem => {
      const basePath = lang === 'ja' ? '/ja/writing/dev-notes' : '/writing/dev-notes'
      const href = `${basePath}/${note.slug}`

      return {
        id: note.id.toString(),
        title: note.title.rendered,
        description: note.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: note.date,
        href,
        categories: extractCategories(note),
      }
    })

    // Fisher-Yatesアルゴリズムでシャッフル
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, limit)
  } catch (error) {
    logger.error('Failed to load related dev-notes', {
      error,
      noteId: currentNote.id,
      limit,
    })
    return []
  }
}

/**
 * すべてのdev-notes記事を取得（sitemap用）
 * @param lang - 言語コード（'ja' または 'en'、デフォルト: 'ja'）
 * @returns BlogItem[] - すべてのdev-notes記事のリスト
 */
export const loadAllDevNotes = async (lang: string = 'ja'): Promise<BlogItem[]> => {
  try {
    const allItems: BlogItem[] = []
    let currentPage = 1
    let totalPages = 1

    const firstResult = await loadDevNotes(currentPage, 100, lang)
    allItems.push(...firstResult.items)
    totalPages = firstResult.totalPages

    while (currentPage < totalPages) {
      currentPage++
      const result = await loadDevNotes(currentPage, 100, lang)
      allItems.push(...result.items)
    }

    return allItems
  } catch (error) {
    logger.error('Failed to load all dev-notes', {
      error,
    })
    return []
  }
}
