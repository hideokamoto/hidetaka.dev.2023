import { describe, expect, it } from 'vitest'
import { ConfigurationError } from './configuration-error'

describe('ConfigurationError', () => {
  it('should store configuration key', () => {
    const error = new ConfigurationError('API key is not configured', 'API_KEY')

    expect(error.message).toBe('API key is not configured')
    expect(error.code).toBe('CONFIGURATION_ERROR')
    expect(error.key).toBe('API_KEY')
  })

  it('should support additional context with hints', () => {
    const error = new ConfigurationError('Database URL is missing', 'DATABASE_URL', {
      hint: 'Set DATABASE_URL environment variable',
      required: true,
    })

    expect(error.key).toBe('DATABASE_URL')
    expect(error.context?.hint).toBe('Set DATABASE_URL environment variable')
    expect(error.context?.required).toBe(true)
  })

  it('should serialize to JSON correctly', () => {
    const error = new ConfigurationError('Invalid config', 'SOME_CONFIG')
    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'ConfigurationError')
    expect(json).toHaveProperty('code', 'CONFIGURATION_ERROR')
    expect(json).toHaveProperty('message', 'Invalid config')
    expect(json.context).toHaveProperty('key', 'SOME_CONFIG')
  })
})
