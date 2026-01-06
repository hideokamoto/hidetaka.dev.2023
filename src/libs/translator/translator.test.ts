import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkTranslatorAvailability,
  createTranslator,
  isTranslatorAvailable,
  translate,
} from './translator'

describe('isTranslatorAvailable', () => {
  beforeEach(() => {
    // windowオブジェクトをリセット
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false when window is undefined', () => {
    vi.stubGlobal('window', undefined)
    expect(isTranslatorAvailable()).toBe(false)
  })

  it('should return false when Translator is not in window', () => {
    vi.stubGlobal('window', {})
    expect(isTranslatorAvailable()).toBe(false)
  })

  it('should return true when Translator exists in window', () => {
    vi.stubGlobal('window', {
      Translator: {},
    })
    expect(isTranslatorAvailable()).toBe(true)
  })
})

describe('checkTranslatorAvailability', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      Translator: {
        availability: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return unavailable when Translator API is not available', async () => {
    vi.stubGlobal('window', {})
    await expect(checkTranslatorAvailability('ja', 'en')).resolves.toBe('unavailable')
  })

  it('should return available when API returns available', async () => {
    const mockWindow = window as Window & { Translator: { availability: ReturnType<typeof vi.fn> } }
    mockWindow.Translator.availability.mockResolvedValue('available')
    const result = await checkTranslatorAvailability('ja', 'en')
    expect(result).toBe('available')
    expect(mockWindow.Translator.availability).toHaveBeenCalledWith({
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    })
  })

  it('should return downloadable when API returns downloadable', async () => {
    const mockWindow = window as Window & { Translator: { availability: ReturnType<typeof vi.fn> } }
    mockWindow.Translator.availability.mockResolvedValue('downloadable')
    const result = await checkTranslatorAvailability('ja', 'en')
    expect(result).toBe('downloadable')
  })

  it('should return downloading when API returns downloading', async () => {
    const mockWindow = window as Window & { Translator: { availability: ReturnType<typeof vi.fn> } }
    mockWindow.Translator.availability.mockResolvedValue('downloading')
    const result = await checkTranslatorAvailability('ja', 'en')
    expect(result).toBe('downloading')
  })

  it('should return unavailable when API throws an error', async () => {
    const mockWindow = window as Window & { Translator: { availability: ReturnType<typeof vi.fn> } }
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockWindow.Translator.availability.mockRejectedValue(new Error('API error'))
    const result = await checkTranslatorAvailability('ja', 'en')
    expect(result).toBe('unavailable')
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

describe('createTranslator', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      Translator: {
        create: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should throw error when Translator API is not available', async () => {
    vi.stubGlobal('window', {})
    await expect(createTranslator('ja', 'en')).rejects.toThrow('Translator API is not available')
  })

  it('should return Translator instance when create succeeds', async () => {
    const mockTranslator = {
      translate: vi.fn(),
      destroy: vi.fn(),
    }
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    mockWindow.Translator.create.mockResolvedValue(mockTranslator)
    const result = await createTranslator('ja', 'en')
    expect(result).toBe(mockTranslator)
    expect(mockWindow.Translator.create).toHaveBeenCalledWith({
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    })
  })

  it('should forward AbortSignal when provided', async () => {
    const mockTranslator = {
      translate: vi.fn(),
      destroy: vi.fn(),
    }
    const signal = new AbortController().signal
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    mockWindow.Translator.create.mockResolvedValue(mockTranslator)
    await createTranslator('ja', 'en', signal)
    expect(mockWindow.Translator.create).toHaveBeenCalledWith({
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      signal,
    })
  })

  it('should throw error with message when NotAllowedError occurs', async () => {
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    const error = new Error('Permission denied')
    error.name = 'NotAllowedError'
    mockWindow.Translator.create.mockRejectedValue(error)
    await expect(createTranslator('ja', 'en')).rejects.toThrow(
      'Translation permission denied. Check Permissions-Policy header.',
    )
  })

  it('should throw error with message when QuotaExceededError occurs', async () => {
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    const error = new Error('Quota exceeded')
    error.name = 'QuotaExceededError'
    mockWindow.Translator.create.mockRejectedValue(error)
    await expect(createTranslator('ja', 'en')).rejects.toThrow(
      'Translation quota exceeded. Please try again later.',
    )
  })

  it('should rethrow AbortError', async () => {
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    mockWindow.Translator.create.mockRejectedValue(abortError)
    await expect(createTranslator('ja', 'en')).rejects.toThrow(abortError)
  })

  it('should rethrow other errors', async () => {
    const mockWindow = window as Window & { Translator: { create: ReturnType<typeof vi.fn> } }
    const error = new Error('Unknown error')
    mockWindow.Translator.create.mockRejectedValue(error)
    await expect(createTranslator('ja', 'en')).rejects.toThrow(error)
  })
})

describe('translate', () => {
  it('should return empty string for whitespace-only text', async () => {
    const mockTranslator = {
      translate: vi.fn(),
      destroy: vi.fn(),
    }
    const result = await translate(mockTranslator as Translator, '   ')
    expect(result).toBe('')
    expect(mockTranslator.translate).not.toHaveBeenCalled()
  })

  it('should return translated text when translation succeeds', async () => {
    const mockTranslator = {
      translate: vi.fn().mockResolvedValue('Translated text'),
      destroy: vi.fn(),
    }
    const result = await translate(mockTranslator as Translator, 'Original text')
    expect(result).toBe('Translated text')
    expect(mockTranslator.translate).toHaveBeenCalledWith('Original text', undefined)
  })

  it('should forward options to translator.translate', async () => {
    const mockTranslator = {
      translate: vi.fn().mockResolvedValue('Translated text'),
      destroy: vi.fn(),
    }
    const signal = new AbortController().signal
    await translate(mockTranslator as Translator, 'Original text', { signal })
    expect(mockTranslator.translate).toHaveBeenCalledWith('Original text', { signal })
  })

  it('should propagate errors from translator.translate', async () => {
    const mockTranslator = {
      translate: vi.fn().mockRejectedValue(new Error('Translation failed')),
      destroy: vi.fn(),
    }
    await expect(translate(mockTranslator as Translator, 'Original text')).rejects.toThrow(
      'Translation failed',
    )
  })

  it('should propagate AbortError', async () => {
    const mockTranslator = {
      translate: vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
      destroy: vi.fn(),
    }
    await expect(translate(mockTranslator as Translator, 'Original text')).rejects.toThrow()
  })
})
