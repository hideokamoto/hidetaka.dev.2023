import { describe, expect, it } from 'vitest'
import { removeHtmlTags } from './sanitize'

describe('removeHtmlTags', () => {
  it('should remove simple HTML tags', () => {
    expect(removeHtmlTags('<p>Hello</p>')).toBe('Hello')
  })

  it('should remove multiple tags', () => {
    expect(removeHtmlTags('<div><strong>Bold</strong> text</div>')).toBe('Bold text')
  })

  it('should remove self-closing tags', () => {
    expect(removeHtmlTags('Line 1<br/>Line 2')).toBe('Line 1Line 2')
  })

  it('should remove tags with attributes', () => {
    expect(removeHtmlTags('<a href="https://example.com">Link</a>')).toBe('Link')
  })

  it('should remove nested tags', () => {
    expect(removeHtmlTags('<div><span><em>Nested</em></span></div>')).toBe('Nested')
  })

  it('should replace [&hellip;] with ...', () => {
    expect(removeHtmlTags('Read more [&hellip;]')).toBe('Read more...')
  })

  it('should handle text with no HTML tags', () => {
    expect(removeHtmlTags('Plain text')).toBe('Plain text')
  })

  it('should handle empty string', () => {
    expect(removeHtmlTags('')).toBe('')
  })

  it('should handle string with only tags', () => {
    expect(removeHtmlTags('<div></div>')).toBe('')
  })

  it('should preserve spaces between words', () => {
    expect(removeHtmlTags('<p>Hello</p> <p>World</p>')).toBe('Hello World')
  })

  it('should handle complex HTML structure', () => {
    const html = '<article><h1>Title</h1><p>First paragraph.</p><p>Second paragraph.</p></article>'
    expect(removeHtmlTags(html)).toBe('TitleFirst paragraph.Second paragraph.')
  })

  it('should return input if falsy', () => {
    expect(removeHtmlTags(null)).toBe(null)
    expect(removeHtmlTags(undefined)).toBe(undefined)
  })
})
