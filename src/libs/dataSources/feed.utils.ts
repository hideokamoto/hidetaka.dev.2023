import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser()
export const loadFeedPosts = async <T extends any>(url: string): Promise<T> => {
    try {
      const response = await fetch(url)
      const feedData = await response.text()
      const parsedItem = parser.parse(feedData)
      if (parsedItem.rss) {
        const { title, link, item, lastBuildDate } = parsedItem.rss.channel
        return {
          lastBuildDate,
          items: item.map((d: any) => {
            return {
              title: d.title,
              content: d.description,
              isoDate: d.pubDate,
              link: d.link
            }
          }),
          feedUrl: link,
          title,
          link
        } as T
      } else if (parsedItem.feed) {
        const { updated, link, title, entry } = parsedItem.feed
        return {
          lastBuildDate: updated,
          items: entry.map((e: any) => {
            return {
              title: e.title,
              content: e.content,
              isoDate: e.updated,
              link: e.url
            }
          }),
          feedUrl: link,
          title,
          link
        } as T
      } else {
        throw new Error("Un supported feed type")
      }
    } catch (e) {
      console.log('Importing feed error', e)
      throw e
    }
  }
  