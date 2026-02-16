import type { createClient } from 'microcms-js-sdk'

export type MicroCMSRecord = {
  id: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  revisedAt?: string
}
export type MicroCMSImageObject = {
  url: string
  height: number
  width: number
}

export type MicroCMSProjectType =
  | 'books'
  | 'owned_oss'
  | 'oss_contribution'
  | 'community_activities'

export type MicroCMSProjectStatus = 'active' | 'deprecated' | 'archived' | 'completed'

export type MicroCMSProjectsRecord = MicroCMSRecord & {
  title: string
  url: string
  published_at?: string
  tags: string[]
  project_type: [MicroCMSProjectType]
  affiliate_link?: string
  image?: MicroCMSImageObject
  lang: ['Japanese' | 'English']
  is_solo: boolean
  status?: MicroCMSProjectStatus
  /**
   * 詳細ページ向け
   **/
  about?: string
  background?: string
  architecture?: string
}

export type MicroCMSClient = Pick<ReturnType<typeof createClient>, 'get' | 'getAllContents'>
