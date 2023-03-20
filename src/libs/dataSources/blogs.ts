import { loadDevToPosts } from "./devto"
import { loadQiitaPosts } from "./qiita"
import type { FeedItem } from "./types"
import { loadWPPosts } from "./wordpress"
import { loadZennPosts } from "./zenn"
export const isJapanese = (locale?: string) => {
    if (!locale) return false
    return /^ja/.test(locale)
  }

  
export const loadBlogPosts = async (locale: 'ja' | 'en' = 'ja') => {
    const wp = await loadWPPosts(isJapanese(locale) ? 'ja' : 'en')
    const devto =  isJapanese(locale) ? [] : await loadDevToPosts()
    const zenn = isJapanese(locale) ? await loadZennPosts() : []
    const qiita = isJapanese(locale) ? await loadQiitaPosts() : []
    return [...wp, ...devto, ...zenn, ...qiita].sort((a: FeedItem, b: FeedItem) => {
          const bDate = new Date(b.datetime)
          const aDate = new Date(a.datetime)
          return bDate.getTime() - aDate.getTime()
    })
}