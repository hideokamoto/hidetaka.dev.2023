/**
 * JsonLd のテスト
 *
 * Person JSON-LD の description は profile-as-a-service（外部）由来になった。
 * その値に `</script>` が混じっていても script 要素を早期終了させないことを固定する。
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import JsonLd from '@/components/JsonLd'

function getScriptHtml(container: HTMLElement): string {
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script) throw new Error('expected a JSON-LD <script> tag')
  return script.innerHTML
}

describe('JsonLd', () => {
  it('renders valid JSON that round-trips through JSON.parse', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Person', name: 'Hidetaka Okamoto' }} />)

    expect(JSON.parse(getScriptHtml(container))).toEqual({
      '@type': 'Person',
      name: 'Hidetaka Okamoto',
    })
  })

  it('never emits a literal </script> even when a field contains one', () => {
    const malicious = '</script><script>alert(1)</script>'

    const { container } = render(<JsonLd data={{ description: malicious }} />)
    const html = getScriptHtml(container)

    expect(html.toLowerCase()).not.toContain('</script')
    // The escaped form still parses back to the original string — nothing is lost,
    // it just can't be interpreted as HTML markup.
    expect(JSON.parse(html)).toEqual({ description: malicious })
  })

  it('is case-insensitive about the closing tag', () => {
    const { container } = render(<JsonLd data={{ description: '</ScRiPt>' }} />)

    expect(getScriptHtml(container).toLowerCase()).not.toContain('</script')
  })
})
