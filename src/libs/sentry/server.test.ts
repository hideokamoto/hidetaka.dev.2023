/**
 * Tests for server-side Sentry with @sentry/cloudflare
 * These tests verify Sentry integration for Cloudflare Workers
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock @sentry/cloudflare before importing the module
vi.mock('@sentry/cloudflare', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('Sentry Server Functions', () => {
  // Spy on console methods
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  // Store original env
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Create spies on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Reset module state by clearing the module cache
    vi.resetModules()
  })

  afterEach(() => {
    // Restore console methods and env after each test
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  describe('initSentry', () => {
    it('should warn if DSN is not configured', async () => {
      delete process.env.SENTRY_DSN
      process.env.NODE_ENV = 'production'

      const { initSentry } = await import('./server')
      initSentry()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Server DSN not configured, skipping initialization (errors will be logged to console)',
      )
    })

    it('should skip initialization in development mode', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'

      const { initSentry } = await import('./server')
      initSentry()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Development mode detected, skipping Sentry initialization',
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('[Sentry] Errors will be logged to console only')
    })

    it('should warn about OpenNext integration requirement in production', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const { initSentry } = await import('./server')
      initSentry()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Server-side Sentry for Cloudflare Workers requires OpenNext integration',
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Server errors will be logged to console and Cloudflare Workers logs',
      )
    })
  })

  describe('captureException', () => {
    it('should always log error to console', async () => {
      const { captureException } = await import('./server')
      const testError = new Error('Test error')
      const context = { userId: '123' }

      captureException(testError, context)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Sentry] Server error:', testError, context)
    })

    it('should attempt to send to Sentry in production with DSN', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const Sentry = await import('@sentry/cloudflare')
      const { captureException } = await import('./server')

      const testError = new Error('Test error')
      const context = { userId: '123' }

      captureException(testError, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(testError, {
        extra: context,
        tags: {
          runtime: 'cloudflare-workers',
          source: 'server',
        },
      })
    })

    it('should not send to Sentry in development', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'

      const Sentry = await import('@sentry/cloudflare')
      const { captureException } = await import('./server')

      const testError = new Error('Test error')

      captureException(testError)

      expect(Sentry.captureException).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle Sentry errors gracefully', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const Sentry = await import('@sentry/cloudflare')
      // Make captureException throw an error
      vi.mocked(Sentry.captureException).mockImplementation(() => {
        throw new Error('Sentry error')
      })

      const { captureException } = await import('./server')
      const testError = new Error('Test error')

      // Should not throw
      expect(() => captureException(testError)).not.toThrow()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Failed to capture exception:',
        expect.any(Error),
      )
    })
  })

  describe('captureMessage', () => {
    it('should always log message to console', async () => {
      const { captureMessage } = await import('./server')

      captureMessage('Test message', 'info', { component: 'test' })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Server message [info]:',
        'Test message',
        { component: 'test' },
      )
    })

    it('should use console.error for error and fatal levels', async () => {
      const { captureMessage } = await import('./server')

      captureMessage('Error message', 'error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Sentry] Server message [error]:',
        'Error message',
        undefined,
      )
    })

    it('should attempt to send to Sentry in production with DSN', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const Sentry = await import('@sentry/cloudflare')
      const { captureMessage } = await import('./server')

      captureMessage('Test message', 'warning', { component: 'test' })

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', {
        level: 'warning',
        extra: { component: 'test' },
        tags: {
          runtime: 'cloudflare-workers',
          source: 'server',
        },
      })
    })

    it('should not send to Sentry in development', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'

      const Sentry = await import('@sentry/cloudflare')
      const { captureMessage } = await import('./server')

      captureMessage('Test message')

      expect(Sentry.captureMessage).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should handle Sentry errors gracefully', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const Sentry = await import('@sentry/cloudflare')
      // Make captureMessage throw an error
      vi.mocked(Sentry.captureMessage).mockImplementation(() => {
        throw new Error('Sentry error')
      })

      const { captureMessage } = await import('./server')

      // Should not throw
      expect(() => captureMessage('Test message')).not.toThrow()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Failed to capture message:',
        expect.any(Error),
      )
    })
  })

  describe('isSentryInitialized', () => {
    it('should always return false', async () => {
      const { isSentryInitialized } = await import('./server')
      expect(isSentryInitialized()).toBe(false)
    })

    it('should return false even after init is called', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'

      const { initSentry, isSentryInitialized } = await import('./server')

      expect(isSentryInitialized()).toBe(false)
      initSentry()
      expect(isSentryInitialized()).toBe(false)
    })
  })
})
