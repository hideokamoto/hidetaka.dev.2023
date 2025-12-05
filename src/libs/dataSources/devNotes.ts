import type { BlogItem, WPDevNote } from './types'
import {
  type AdjacentPosts,
  getAdjacentWordPressPosts,
  getRelatedWordPressPosts,
  getWordPressPostBySlug,
  loadAllWordPressPosts,
  loadWordPressPosts,
  type PostsResult,
} from './wordpressCommon'

const POST_TYPE = 'dev-notes' as const
const BASE_PATH = '/ja/dev-notes'

export type DevNotesResult = PostsResult
export type AdjacentDevNotes = AdjacentPosts<WPDevNote>

export const loadDevNotes = async (
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en',
): Promise<DevNotesResult> => {
  return loadWordPressPosts(POST_TYPE, page, perPage, lang, BASE_PATH)
}

export const getDevNoteBySlug = async (
  slug: string,
  lang: 'en' | 'ja' = 'en',
): Promise<WPDevNote | null> => {
  return getWordPressPostBySlug<WPDevNote>(POST_TYPE, slug, lang)
}

export const getAdjacentDevNotes = async (
  currentDevNote: WPDevNote,
  lang: 'en' | 'ja' = 'en',
): Promise<AdjacentDevNotes> => {
  return getAdjacentWordPressPosts<WPDevNote>(POST_TYPE, currentDevNote, lang)
}

export const loadAllDevNotes = async (lang: 'en' | 'ja' = 'en'): Promise<BlogItem[]> => {
  return loadAllWordPressPosts(POST_TYPE, lang, BASE_PATH)
}

export const getRelatedDevNotes = async (
  currentDevNote: WPDevNote,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
): Promise<BlogItem[]> => {
  return getRelatedWordPressPosts<WPDevNote>(POST_TYPE, currentDevNote, limit, lang, BASE_PATH)
}
