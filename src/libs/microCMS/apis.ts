import dayjs from 'dayjs'
import { MICROCMS_MOCK_BOOKs, MICROCMS_MOCK_EVENTs } from './mocks'
import type { MicroCMSClient, MicroCMSEventsRecord, MicroCMSProjectsRecord } from './types'

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
  }
  public async listUpcomingEvents () {
    const thisMonth = dayjs().format('YYYY-MM')
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_EVENTs
      }
      return []
    }
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
  }
  public async listGuestPosts (): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
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
  }
  public async listAllProjects (): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    const projects = await this.client.getAllContents({
      endpoint: 'projects',
    })
    return projects
  }
  public async listApps (): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    const { contents: events } = await this.client.get<{
      contents: MicroCMSProjectsRecord[]
    }>({
      endpoint: 'projects',
      queries: {
        orders: '-published_at',
        filters: `project_type[contains]applications`,
      },
    })
    return events
  }
  public async listBooks (): Promise<MicroCMSProjectsRecord[]> {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
    const { contents: events } = await this.client.get<{
      contents: MicroCMSProjectsRecord[]
    }>({
      endpoint: 'projects',
      queries: {
        orders: '-published_at',
        filters: `project_type[contains]books`,
      },
    })
    return events
  }
  public async listFeaturedBooks () {
    if (!this.client) {
      if (process.env.MICROCMS_API_MODE === 'mock') {
        return MICROCMS_MOCK_BOOKs
      }
      return []
    }
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
  }
}