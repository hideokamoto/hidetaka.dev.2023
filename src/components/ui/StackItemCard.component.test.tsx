/**
 * StackItemCard コンポーネントのテスト
 *
 * href の有無によるレンダリング分岐（div / a）を検証します。
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StackItemCard from '@/components/ui/StackItemCard'

describe('StackItemCard', () => {
  it('href が無い場合はリンクを描画しない', () => {
    render(<StackItemCard name="WordPress" description="Enterprise · Headless · VIP" gradient="" />)

    expect(screen.getByText('WordPress')).toBeInTheDocument()
    expect(screen.getByText('Enterprise · Headless · VIP')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('href がある場合は外部リンク属性付きの a 要素を描画する', () => {
    render(
      <StackItemCard
        name="Stripe"
        description="Billing · Connect · Radar"
        gradient=""
        href="https://revtrona.com"
        linkLabel="Details at Revtrona.com"
      />,
    )

    const link = screen.getByRole('link', { name: /Stripe/ })
    expect(link).toHaveAttribute('href', 'https://revtrona.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('aria-label', 'Stripe — Details at Revtrona.com')
    expect(screen.getByText('Details at Revtrona.com')).toBeInTheDocument()
  })

  it('focusLabel を指定すると表示される', () => {
    render(<StackItemCard name="React" description="Hooks" gradient="" focusLabel="Focus" />)

    expect(screen.getByText('Focus')).toBeInTheDocument()
  })
})
