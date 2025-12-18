export function removeHtmlTags(str: string): string
export function removeHtmlTags(str: null): null
export function removeHtmlTags(str: undefined): undefined
export function removeHtmlTags(str: string | null | undefined): string | null | undefined
export function removeHtmlTags(str: string | null | undefined): string | null | undefined {
  if (!str) return str
  return str.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '').replace(/ \[&hellip;\]/, '...')
}
