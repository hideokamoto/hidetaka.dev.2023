/**
 * Tests for browser-side Sentry client functions
 * These tests verify the guard behavior and initialization logic
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { captureException, captureMessage, initSentry } from './client'

// Mock @sentry/nextjs module
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  isInitialized: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('Sentry Client Functions', () => {
  // Import mocked Sentry after mocking
  let Sentry: typeof import('@sentry/nextjs')

  // Spy on console methods
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  // Store original env values
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(async () => {
    // Store original environment
    originalEnv = { ...process.env }

    // Import the mocked Sentry module
    Sentry = await import('@sentry/nextjs')

    // Create spies on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()

    // Restore environment
    process.env = originalEnv

    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('initSentry', () => {
    it('should skip initialization when NEXT_PUBLIC_SENTRY_DSN is not set', () => {
      // Arrange: No DSN set
      delete process.env.NEXT_PUBLIC_SENTRY_DSN
      process.env.NODE_ENV = 'production'

      // Act
      initSentry()

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Browser DSN not configured, skipping initialization',
      )
      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should skip initialization when NODE_ENV is not production', () => {
      // Arrange: Development mode
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'

      // Act
      initSentry()

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Development mode detected, skipping Sentry initialization',
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('[Sentry] Errors will be logged to console only')
      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should skip initialization when NODE_ENV is test', () => {
      // Arrange: Test mode
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'test'

      // Act
      initSentry()

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Sentry] Development mode detected, skipping Sentry initialization',
      )
      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should skip initialization when already initialized', () => {
      // Arrange: Production mode with DSN, but already initialized
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      Sentry.isInitialized.mockReturnValue(true)

      // Act
      initSentry()

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Sentry] Browser SDK already initialized')
      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should initialize Sentry when DSN is set, NODE_ENV is production, and not already initialized', () => {
      // Arrange
      const testDsn = 'https://test@sentry.io/123'
      process.env.NEXT_PUBLIC_SENTRY_DSN = testDsn
      process.env.NODE_ENV = 'production'
      Sentry.isInitialized.mockReturnValue(false)

      // Act
      initSentry()

      // Assert
      expect(Sentry.init).toHaveBeenCalledTimes(1)
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: testDsn,
          environment: 'production',
          tracesSampleRate: 0,
          ignoreErrors: expect.any(Array),
          beforeSend: expect.any(Function),
        }),
      )
      expect(consoleLogSpy).toHaveBeenCalledWith('[Sentry] Browser SDK initialized')
    })

    it('should configure beforeSend to add runtime tag', () => {
      // Arrange
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      Sentry.isInitialized.mockReturnValue(false)

      // Act
      initSentry()

      // Assert
      const initConfig = Sentry.init.mock.calls[0][0]
      const beforeSend = initConfig.beforeSend

      // Test beforeSend adds runtime tag when tags exist
      const eventWithTags = { tags: { existing: 'tag' } }
      const result1 = beforeSend(eventWithTags, {})
      expect(result1.tags.runtime).toBe('browser')
      expect(result1.tags.existing).toBe('tag')

      // Test beforeSend adds runtime tag when tags don't exist
      const eventWithoutTags = {}
      const result2 = beforeSend(eventWithoutTags, {})
      expect(result2.tags).toEqual({ runtime: 'browser' })
    })
  })

  describe('captureException', () => {
    it('should log warning and not call Sentry.captureException when not initialized', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(false)
      const testError = new Error('Test error')
      const context = { userId: '123' }

      // Act
      captureException(testError, context)

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Browser SDK not initialized, skipping error capture',
      )
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    it('should call Sentry.captureException with correct args when initialized', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(true)
      const testError = new Error('Test error')
      const context = { userId: '123', action: 'test' }

      // Act
      captureException(testError, context)

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
      expect(Sentry.captureException).toHaveBeenCalledWith(testError, {
        extra: context,
      })
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should call Sentry.captureException without context when context is undefined', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(true)
      const testError = new Error('Test error without context')

      // Act
      captureException(testError)

      // Assert
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
      expect(Sentry.captureException).toHaveBeenCalledWith(testError, {
        extra: undefined,
      })
    })
  })

  describe('captureMessage', () => {
    it('should log warning and not call Sentry.captureMessage when not initialized', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(false)
      const message = 'Test message'
      const context = { component: 'test' }

      // Act
      captureMessage(message, 'info', context)

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Sentry] Browser SDK not initialized, skipping message capture',
      )
      expect(Sentry.captureMessage).not.toHaveBeenCalled()
    })

    it('should call Sentry.captureMessage with correct args when initialized', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(true)
      const message = 'Test message'
      const context = { component: 'test', userId: '123' }

      // Act
      captureMessage(message, 'warning', context)

      // Assert
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1)
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
        level: 'warning',
        extra: context,
      })
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should use default level (info) when level is not provided', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(true)
      const message = 'Test message with default level'

      // Act
      captureMessage(message)

      // Assert
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1)
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
        level: 'info',
        extra: undefined,
      })
    })

    it('should handle all severity levels', () => {
      // Arrange
      Sentry.isInitialized.mockReturnValue(true)
      const levels: Array<'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'> = [
        'fatal',
        'error',
        'warning',
        'log',
        'info',
        'debug',
      ]

      // Act & Assert
      for (const level of levels) {
        Sentry.captureMessage.mockClear()
        captureMessage('Test', level)

        expect(Sentry.captureMessage).toHaveBeenCalledWith('Test', {
          level,
          extra: undefined,
        })
      }
    })
  })
})
