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
  export type Category = {
    id: number
    name: string
    slug: string
    taxonomy: string
  }

  export type BlogItem = {
    id?: string
    title: string
    href: string
    description: string
    datetime: string
    categories?: Category[]
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
export type WPThought = {
        id: number
        title: {
          rendered: string
        }
        date: string
        date_gmt: string
        modified: string
        modified_gmt: string
        excerpt: {
          rendered: string
        }
        content: {
          rendered: string
        }
        link: string
        slug: string
        featured_media?: number
        categories?: number[]
        _embedded?: {
          'wp:term'?: Array<Array<{
            id: number
            name: string
            slug: string
            taxonomy: string
          }>>
        }
      }
