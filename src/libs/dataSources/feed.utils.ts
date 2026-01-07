import { XMLParser } from 'fast-xml-parser'
import { logger } from '@/libs/logger'

const parser = new XMLParser()

// RSSフィードのアイテム型定義
type RSSItem = {
  title: string
  description: string
  pubDate: string
  link: string
}

// Atomフィードのエントリ型定義
type AtomEntry = {
  title: string
  content: string
  updated: string
  url: string
}

// RSSフィードを処理するヘルパー関数
export const processRSSFeed = <T>(parsedItem: {
  rss: {
    channel: {
      title: string
      link: string
      item: RSSItem | RSSItem[] | undefined
      lastBuildDate?: string
    }
  }
}): T => {
  const { title, link, item, lastBuildDate } = parsedItem.rss.channel
  // itemが配列でない場合（単一アイテム）やundefined/nullの場合に対応
  const items = Array.isArray(item) ? item : item ? [item] : []
  return {
    lastBuildDate,
    items: items.map((d: RSSItem) => ({
      title: d.title,
      content: d.description,
      isoDate: d.pubDate,
      link: d.link,
    })),
    feedUrl: link,
    title,
    link,
  } as T
}

// Atomフィードを処理するヘルパー関数
export const processAtomFeed = <T>(parsedItem: {
  feed: {
    title: string
    link: string
    entry: AtomEntry | AtomEntry[] | undefined
    updated?: string
  }
}): T => {
  const { updated, link, title, entry } = parsedItem.feed
  // entryが配列でない場合（単一エントリ）やundefined/nullの場合に対応
  const entries = Array.isArray(entry) ? entry : entry ? [entry] : []
  return {
    lastBuildDate: updated,
    items: entries.map((e: AtomEntry) => ({
      title: e.title,
      content: e.content,
      isoDate: e.updated,
      link: e.url,
    })),
    feedUrl: link,
    title,
    link,
  } as T
}

export const loadFeedPosts = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url, {
      next: { revalidate: 7200 }, // 2時間ごとに再検証（週一程度の更新）
    })
    const feedData = await response.text()
    const parsedItem = parser.parse(feedData)
    if (parsedItem.rss) {
      return processRSSFeed<T>(parsedItem)
    }
    if (parsedItem.feed) {
      return processAtomFeed<T>(parsedItem)
    }
    throw new Error('Unsupported feed type')
  } catch (e) {
    logger.error('Failed to import feed', {
      error: e instanceof Error ? e.message : String(e),
      url,
    })
    throw e
  }
}
