
export type FeedDataSource = {
    href: string
    name: string
    color: string
  }
  export type FeedItem = {
    id?: string
    title: string
    href: string
    description: string
    datetime: string
    dataSource: FeedDataSource
    image?: string
  }
  type Feed = {
    title: string
    link: string
    isoDate: string
    content: string
  }
  export type QiitaAtomFeed = {
      items: Array<Feed>
      link: string
      feedUrl: string
      title: string
      lastBuildDate: string
    }
export type ZennFeed = {
      items: Array<Feed>
      title: string
      description: string
      generator: string
      link: string
      language: string
      lastBuildDate: string
    }
export type WPPost = {
        title: {
          rendered: string
        }
        date: string
        date_gmt: string
        excerpt: {
          rendered: string
        }
        link: string
        id: string
      }