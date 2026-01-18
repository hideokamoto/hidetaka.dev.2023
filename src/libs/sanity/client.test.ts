import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('sanity/client', () => {
  beforeEach(() => {
    // Reset modules before each test to allow re-importing with different env vars
    vi.resetModules()
    // Clear all environment variable stubs
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    // Restore original environment
    vi.unstubAllEnvs()
  })

  it('should throw error when NEXT_PUBLIC_SANITY_PROJECT_ID is missing', async () => {
    // Stub env without the required var
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', undefined)

    // Import should throw an error
    await expect(async () => {
      await import('./client')
    }).rejects.toThrow('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  })

  it('should initialize successfully when NEXT_PUBLIC_SANITY_PROJECT_ID is set', async () => {
    // Stub required env vars
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production')

    // Import should succeed
    const clientModule = await import('./client')

    expect(clientModule.client).toBeDefined()
    expect(clientModule.previewClient).toBeDefined()
    expect(clientModule.getClient).toBeDefined()
  })

  it('should use default dataset when NEXT_PUBLIC_SANITY_DATASET is not set', async () => {
    // Stub only the required env var
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', undefined)

    // Import should succeed and use default dataset
    const clientModule = await import('./client')

    expect(clientModule.client).toBeDefined()
    expect(clientModule.previewClient).toBeDefined()
  })

  it('should return production client when getClient is called without preview flag', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')

    const { getClient, client } = await import('./client')
    const returnedClient = getClient(false)

    expect(returnedClient).toBe(client)
  })

  it('should return preview client when getClient is called with preview flag', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')
    vi.stubEnv('SANITY_API_TOKEN', 'test-token')

    const { getClient, previewClient } = await import('./client')
    const returnedClient = getClient(true)

    expect(returnedClient).toBe(previewClient)
  })

  it('should throw error when getClient is called with preview=true but SANITY_API_TOKEN is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project-id')
    vi.stubEnv('SANITY_API_TOKEN', undefined)

    const { getClient } = await import('./client')

    expect(() => getClient(true)).toThrow('Missing SANITY_API_TOKEN')
  })
})
