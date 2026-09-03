import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/libs/sentry/client', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('logger', () => {
  const originalEnv = { ...process.env }
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.resetModules()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('log', () => {
    it('writes to console in development', async () => {
      process.env.NODE_ENV = 'development'
      const { logger } = await import('./logger')

      logger.log('debug message', { id: 1 })

      expect(consoleLogSpy).toHaveBeenCalledWith('[LOG]', 'debug message', { id: 1 })
    })

    it('does not write to console outside development', async () => {
      process.env.NODE_ENV = 'production'
      const { logger } = await import('./logger')

      logger.log('debug message')

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('always writes to console.error', async () => {
      process.env.NODE_ENV = 'test'
      const { logger } = await import('./logger')

      logger.error('request failed', { statusCode: 500 })

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'request failed', { statusCode: 500 })
    })

    it('sends to Sentry in production browser environments', async () => {
      process.env.NODE_ENV = 'production'
      vi.stubGlobal('window', {})
      const { logger } = await import('./logger')
      const { captureException } = await import('@/libs/sentry/client')

      logger.error('request failed', { endpoint: '/api/posts' })

      await vi.waitFor(() => {
        expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
          endpoint: '/api/posts',
          source: 'logger',
        })
      })
    })
  })

  describe('warn', () => {
    it('always writes to console.warn', async () => {
      process.env.NODE_ENV = 'test'
      const { logger } = await import('./logger')

      logger.warn('deprecated API', { api: 'oldMethod' })

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'deprecated API', { api: 'oldMethod' })
    })

    it('sends to Sentry in production browser environments', async () => {
      process.env.NODE_ENV = 'production'
      vi.stubGlobal('window', {})
      const { logger } = await import('./logger')
      const { captureMessage } = await import('@/libs/sentry/client')

      logger.warn('deprecated API', { api: 'oldMethod' })

      await vi.waitFor(() => {
        expect(captureMessage).toHaveBeenCalledWith('deprecated API', 'warning', {
          api: 'oldMethod',
          source: 'logger',
        })
      })
    })
  })
})
