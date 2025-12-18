import dayjs from 'dayjs'
import { reportMicroCMSApiError } from '../sentry'
import { MICROCMS_MOCK_BOOKs, MICROCMS_MOCK_EVENTs, MICROCMS_MOCK_POSTs } from './mocks'
import type {
  MicroCMSClient,
  MicroCMSEventsRecord,
  MicroCMSPostsRecord,
  MicroCMSProjectsRecord,
} from './types'

export class MicroCMSAPI {
  private readonly client: MicroCMSClient
  constructor(client: MicroCMSClient) {
    this.client = client
  }
  public async listEndedEvents() {
    const thisMonth = dayjs().format('YYYY-MM')
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_EVENTs
      }
      return []
    }
    try {
      const { contents: events } = await this.client.get<{
        contents: MicroCMSEventsRecord[]
      }>({
        endpoint: 'events',
        queries: {
          orders: '-date',
          limit: 20,
          filters: `date[less_than]${thisMonth}`,
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'events', method: 'listEndedEvents' })
      return []
    }
  }
  public async listUpcomingEvents() {
    const thisMonth = dayjs().format('YYYY-MM')
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_EVENTs
      }
      return []
    }
    try {
      const { contents: events } = await this.client.get<{
        contents: MicroCMSEventsRecord[]
      }>({
        endpoint: 'events',
        queries: {
          orders: '-date',
          filters: `date[greater_than]${thisMonth}`,
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'events', method: 'listUpcomingEvents' })
      return []
    }
  }
  public async listGuestPosts(): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    try {
      const { contents: events } = await this.client.get<{
        contents: MicroCMSProjectsRecord[]
      }>({
        endpoint: 'projects',
        queries: {
          orders: '-published_at',
          filters: `project_type[contains]guest_posts`,
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'projects', method: 'listGuestPosts' })
      return []
    }
  }
  public async listAllProjects(): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    try {
      const projects = await this.client.getAllContents({
        endpoint: 'projects',
      })
      return projects
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'projects', method: 'listAllProjects' })
      return []
    }
  }
  public async listApps(): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    try {
      const { contents: events } = await this.client.get<{
        contents: MicroCMSProjectsRecord[]
      }>({
        endpoint: 'projects',
        queries: {
          orders: '-published_at',
          filters: `project_type[contains]applications`,
          limit: 50,
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'projects', method: 'listApps' })
      return []
    }
  }
  public async listBooks(): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    try {
      const { contents: events } = await this.client.get<{
        contents: MicroCMSProjectsRecord[]
      }>({
        endpoint: 'projects',
        queries: {
          orders: '-published_at',
          filters: `project_type[contains]books`,
          limit: 50,
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'projects', method: 'listBooks' })
      return []
    }
  }
  public async listFeaturedBooks() {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    try {
      return [
        await this.client.get<MicroCMSProjectsRecord>({
          endpoint: 'projects',
          contentId: '48xxv5o8vt8j',
        }),
        await this.client.get<MicroCMSProjectsRecord>({
          endpoint: 'projects',
          contentId: 'iutgcn7l3ad',
        }),
      ]
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'projects', method: 'listFeaturedBooks' })
      return []
    }
  }
  public async listPosts(query?: {
    lang?: 'japanese' | 'english'
  }): Promise<MicroCMSPostsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_POSTs
      }
      return []
    }
    try {
      const lang = query?.lang ?? null
      const { contents: posts } = await this.client.get<{
        contents: MicroCMSPostsRecord[]
      }>({
        endpoint: 'posts',
        queries: {
          orders: '-publishedAt',
          filters: [lang ? `lang[contains]${query?.lang}` : undefined]
            .filter(Boolean)
            .join('[and]'),
          limit: 50,
        },
      })
      return posts
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'posts', method: 'listPosts' })
      return []
    }
  }

  public async getPost(id: string): Promise<MicroCMSPostsRecord | null> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        const post = MICROCMS_MOCK_POSTs.find((post) => post.id === id)
        return post || null
      }
      return null
    }
    try {
      const post = await this.client.get<MicroCMSPostsRecord>({
        endpoint: 'posts',
        contentId: id,
      })
      return post
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'posts', method: 'getPost', contentId: id })
      return null
    }
  }

  /**
   * すべての投稿記事を取得（sitemap用）
   */
  public async listAllPosts(query?: {
    lang?: 'japanese' | 'english'
  }): Promise<MicroCMSPostsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_POSTs
      }
      return []
    }
    try {
      const lang = query?.lang ?? null
      const posts = await this.client.getAllContents<MicroCMSPostsRecord>({
        endpoint: 'posts',
        queries: {
          orders: '-publishedAt',
          filters: [lang ? `lang[contains]${query?.lang}` : undefined]
            .filter(Boolean)
            .join('[and]'),
        },
      })
      return posts
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'posts', method: 'listAllPosts' })
      return []
    }
  }

  /**
   * すべてのイベントを取得（sitemap用）
   */
  public async listAllEvents(): Promise<MicroCMSEventsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_EVENTs
      }
      return []
    }
    try {
      const events = await this.client.getAllContents<MicroCMSEventsRecord>({
        endpoint: 'events',
        queries: {
          orders: '-date',
        },
      })
      return events
    } catch (error) {
      reportMicroCMSApiError(error, { endpoint: 'events', method: 'listAllEvents' })
      return []
    }
  }
}
