import { describe, expect, it } from 'vitest'
import { BaseError } from './base'

// Concrete implementation for testing
class TestError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'TEST_ERROR', context)
  }
}

describe('BaseError', () => {
  it('should create error with message and code', () => {
    const error = new TestError('Test message')

    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.name).toBe('TestError')
  })

  it('should store context information', () => {
    const context = { userId: '123', action: 'test' }
    const error = new TestError('Test message', context)

    expect(error.context).toEqual(context)
  })

  it('should have timestamp', () => {
    const before = new Date()
    const error = new TestError('Test message')
    const after = new Date()

    expect(error.timestamp).toBeInstanceOf(Date)
    expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should serialize to JSON correctly', () => {
    const error = new TestError('Test message', { key: 'value' })
    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'TestError')
    expect(json).toHaveProperty('code', 'TEST_ERROR')
    expect(json).toHaveProperty('message', 'Test message')
    expect(json).toHaveProperty('timestamp')
    expect(json).toHaveProperty('context')
    expect(json).toHaveProperty('stack')
    expect(json.context).toEqual({ key: 'value' })
  })

  it('should have stack trace', () => {
    const error = new TestError('Test message')

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('TestError')
    expect(error.stack).toContain('Test message')
  })

  it('should be instance of Error', () => {
    const error = new TestError('Test message')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(BaseError)
  })
})
