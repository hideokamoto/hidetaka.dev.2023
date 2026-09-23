/**
 * Content Lake Gold が配信する集計 JSON の型。
 * vibes-wp-content-enrichment が日次で生成し、lake.hidetaka.dev から配信される。
 */

export type AboutGoldWriting = {
  source: 'wordpress'
  total: number
  firstYear: number
  yearsActive: number
  /** 年の昇順 */
  byYear: { year: number; count: number; cumulative: number }[]
}

export type AboutGoldOss = {
  npm: { packages: { value: number; asOf: string } } | null
  wordpressOrg: {
    plugins: number
    activeInstalls: { value: number; asOf: string }
    downloads: { value: number; asOf: string }
  } | null
}

export type WritingGoldMonthly = {
  year: number
  month: number
  total: number
  bySource: Record<string, number>
}

export type WritingGold = {
  schemaVersion: 1
  target: string
  generatedAt: string
  monthly: WritingGoldMonthly[]
  topTags: { tag: string; count: number }[]
  coverage: Record<string, number>
  firstPublishedAt: string | null
  lastPublishedAt: string | null
  totals: { articleCount: number; bySource: Record<string, number> }
}

export type ContentIndexItem = {
  id: string
  title: string
  url: string
  publishedAt: string
  source: string
  type: string
}

export type ContentIndexGold = {
  target: string
  updatedAt: string
  itemCount: number
  items: ContentIndexItem[]
}

export type AboutGold = {
  schemaVersion: 1
  target: string
  generatedAt: string
  writing: AboutGoldWriting | null
  speaking: { reports: number }
  oss: AboutGoldOss
}

export type SlideGoldDataSource = { name: string; href: string; color: string }

export type SlideGoldItem = {
  id: string
  source: string
  type: string
  title: string
  url: string
  publishedAt: string
  excerpt?: string
  dataSource?: SlideGoldDataSource
}

export type SlidesGold = {
  target: string
  updatedAt: string
  itemCount: number
  items: SlideGoldItem[]
}
