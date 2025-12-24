import { logger } from '@/libs/logger'

export const listMyNPMPackages = async () => {
  try {
    const { objects: packages } = await searchNPMPackages('text=author:hideokamoto').catch(() => ({
      objects: [],
    }))
    const { objects: wpkyotoPackages } = await searchNPMPackages('text=@wpkyoto').catch(() => ({
      objects: [],
    }))
    const { objects: talkyjsPackages } = await searchNPMPackages('text=@talkyjs').catch(() => ({
      objects: [],
    }))
    const allPackages = [...packages, ...wpkyotoPackages, ...talkyjsPackages]
    // パッケージ名で重複を除去
    const uniquePackages = new Map<string, NPMRegistrySearchResult>()
    for (const pkg of allPackages) {
      const packageName = pkg.package.name
      if (!uniquePackages.has(packageName)) {
        uniquePackages.set(packageName, pkg)
      }
    }
    return Array.from(uniquePackages.values())
  } catch (error) {
    logger.error('Failed to load NPM packages', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}
export type NPMPackageDetail = {
  name: string
  scope: string
  version: string
  description: string
  keywords: string[]
  date: string
  links: {
    npm: string
    homepage?: string
    repositoty?: string
    bugs?: string
  }
  author: {
    name?: string
    email?: string
    url?: string
    username?: string
  }
  publisher: {
    username: string
    email: string
  }
  maintainers: Array<{
    username: string
    email: string
  }>
}
export type NPMRegistrySearchResult = {
  package: NPMPackageDetail
  score: {
    final: number
    detail: {
      quantity: number
      popularity: number
      mainenance: number
    }
    searchScore: number
  }
}
export type NPMRegistrySearchResponse = {
  objects: NPMRegistrySearchResult[]
  time: string
  total: number
}

export const searchNPMPackages = async (query: string): Promise<NPMRegistrySearchResponse> => {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?${query}&size=50`)
    const result = await res.json()
    return result
  } catch (e) {
    logger.error('Failed to search NPM packages', {
      error: e instanceof Error ? e.message : String(e),
      query,
    })
    throw e
  }
}
