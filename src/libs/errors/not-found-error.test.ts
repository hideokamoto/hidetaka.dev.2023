import { describe, expect, it } from 'vitest'
import { NotFoundError } from './not-found-error'

describe('NotFoundError', () => {
  it('should generate proper error message', () => {
    const error = new NotFoundError('User', '123')

    expect(error.message).toBe('User not found: 123')
    expect(error.code).toBe('NOT_FOUND')
  })

  it('should store resource and identifier in context', () => {
    const error = new NotFoundError('Post', 'abc-def')

    expect(error.context?.resource).toBe('Post')
    expect(error.context?.identifier).toBe('abc-def')
  })

  it('should support additional context', () => {
    const error = new NotFoundError('Product', '999', {
      category: 'electronics',
      attempted_at: '2025-01-25',
    })

    expect(error.context?.resource).toBe('Product')
    expect(error.context?.identifier).toBe('999')
    expect(error.context?.category).toBe('electronics')
    expect(error.context?.attempted_at).toBe('2025-01-25')
  })

  it('should serialize to JSON correctly', () => {
    const error = new NotFoundError('Article', '456')
    const json = error.toJSON()

    expect(json).toHaveProperty('name', 'NotFoundError')
    expect(json).toHaveProperty('code', 'NOT_FOUND')
    expect(json).toHaveProperty('message', 'Article not found: 456')
    expect(json.context).toHaveProperty('resource', 'Article')
    expect(json.context).toHaveProperty('identifier', '456')
  })
})
