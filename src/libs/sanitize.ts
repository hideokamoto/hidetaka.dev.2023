export function removeHtmlTags(str: string): string {
  if (!str) return str
  return str.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '').replace(/ \[&hellip;\]/, '...')
}
