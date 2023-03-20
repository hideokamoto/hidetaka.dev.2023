import Parser from 'rss-parser'

export const loadFeedPosts = async <T extends any>(url: string): Promise<T> => {
    const parser = new Parser()
    try {
      const result = await parser.parseURL(url)
      return result as any as T
    } catch (e) {
      console.log('Importing feed error', e)
      throw e
    }
  }
  