import { describe, expect, it } from 'vitest'
import { ValidationError } from './validation-error'

describe('ValidationError', () => {
  it('should store field and value information', () => {
    const error = new ValidationError('Invalid email format', 'email', 'invalid-email')

    expect(error.message).toBe('Invalid email format')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.field).toBe('email')
    expect(error.value).toBe('invalid-email')
  })

  it('should store additional context', () => {
    const error = new ValidationError('Invalid age', 'age', -1, {
      min: 0,
      max: 120,
    })

    expect(error.field).toBe('age')
    expect(error.value).toBe(-1)
    expect(error.context?.min).toBe(0)
    expect(error.context?.max).toBe(120)
  })

  it('should handle complex values', () => {
    const complexValue = { nested: { data: 'value' } }
    const error = new ValidationError('Invalid object', 'data', complexValue)

    expect(error.value).toEqual(complexValue)
  })

  it('should serialize to JSON correctly', () => {
    const error = new ValidationError('Invalid email', 'email', 'test')
    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'ValidationError')
    expect(json).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(json.context).toHaveProperty('field', 'email')
    expect(json.context).toHaveProperty('value', 'test')
  })
})
