import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('sanity/client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset modules before each test to allow re-importing with different env vars
    vi.resetModules()
    // Reset process.env
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  it('should throw error when NEXT_PUBLIC_SANITY_PROJECT_ID is missing', async () => {
    // Remove the required env var
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

    // Import should throw an error
    await expect(async () => {
      await import('./client')
    }).rejects.toThrow('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  })

  it('should initialize successfully when NEXT_PUBLIC_SANITY_PROJECT_ID is set', async () => {
    // Set the required env var
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id'
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'

    // Import should succeed
    const clientModule = await import('./client')

    expect(clientModule.client).toBeDefined()
    expect(clientModule.previewClient).toBeDefined()
    expect(clientModule.getClient).toBeDefined()
  })

  it('should use default dataset when NEXT_PUBLIC_SANITY_DATASET is not set', async () => {
    // Set only the required env var
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id'
    delete process.env.NEXT_PUBLIC_SANITY_DATASET

    // Import should succeed and use default dataset
    const clientModule = await import('./client')

    expect(clientModule.client).toBeDefined()
    expect(clientModule.previewClient).toBeDefined()
  })

  it('should return production client when getClient is called without preview flag', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id'

    const { getClient, client } = await import('./client')
    const returnedClient = getClient(false)

    expect(returnedClient).toBe(client)
  })

  it('should return preview client when getClient is called with preview flag', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id'
    process.env.SANITY_API_TOKEN = 'test-token'

    const { getClient, previewClient } = await import('./client')
    const returnedClient = getClient(true)

    expect(returnedClient).toBe(previewClient)
  })

  it('should throw error when getClient is called with preview=true but SANITY_API_TOKEN is missing', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id'
    delete process.env.SANITY_API_TOKEN

    const { getClient } = await import('./client')

    expect(() => getClient(true)).toThrow('Missing SANITY_API_TOKEN')
  })
})
