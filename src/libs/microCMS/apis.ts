import { MICROCMS_MOCK_BOOKs } from './mocks'
import type { MicroCMSClient, MicroCMSProjectsRecord } from './types'
import { handleMicroCMSRequest } from './utils'

export class MicroCMSAPI {
  private readonly client: MicroCMSClient
  constructor(client: MicroCMSClient) {
    this.client = client
  }
  public async listGuestPosts(): Promise<MicroCMSProjectsRecord[]> {
    return handleMicroCMSRequest(
      this.client,
      MICROCMS_MOCK_BOOKs,
      async () => {
        const { contents: events } = await this.client!.get<{
          contents: MicroCMSProjectsRecord[]
        }>({
          endpoint: 'projects',
          queries: {
            orders: '-published_at',
            filters: `project_type[contains]guest_posts`,
          },
        })
        return events
      },
      [],
    )
  }
  public async listAllProjects(): Promise<MicroCMSProjectsRecord[]> {
    return handleMicroCMSRequest(
      this.client,
      MICROCMS_MOCK_BOOKs,
      async () => {
        return await this.client!.getAllContents({
          endpoint: 'projects',
        })
      },
      [],
    )
  }
  public async listApps(): Promise<MicroCMSProjectsRecord[]> {
    return handleMicroCMSRequest(
      this.client,
      MICROCMS_MOCK_BOOKs,
      async () => {
        const { contents: events } = await this.client!.get<{
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
      },
      [],
    )
  }
  public async listBooks(): Promise<MicroCMSProjectsRecord[]> {
    return handleMicroCMSRequest(
      this.client,
      MICROCMS_MOCK_BOOKs,
      async () => {
        const { contents: events } = await this.client!.get<{
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
      },
      [],
    )
  }
  public async listFeaturedBooks() {
    return handleMicroCMSRequest(
      this.client,
      MICROCMS_MOCK_BOOKs,
      async () => {
        return [
          await this.client!.get<MicroCMSProjectsRecord>({
            endpoint: 'projects',
            contentId: '48xxv5o8vt8j',
          }),
          await this.client!.get<MicroCMSProjectsRecord>({
            endpoint: 'projects',
            contentId: 'iutgcn7l3ad',
          }),
        ]
      },
      [],
    )
  }
}
