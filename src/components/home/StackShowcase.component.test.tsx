/**
 * StackShowcase コンポーネントのテスト
 *
 * 6カテゴリ階層表示と、Stripe の revtrona.com 外部リンクを検証します。
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StackShowcase from '@/components/home/StackShowcase'

const EN_CATEGORIES = [
  'Backend & Infrastructure',
  'Frontend',
  'Payment & SaaS',
  'CMS & Content',
  'DevOps & CI/CD',
  'AI Development',
]

const JA_CATEGORIES = [
  'バックエンド・インフラ',
  'フロントエンド',
  '決済・SaaS',
  'CMS・コンテンツ',
  'DevOps・CI/CD',
  'AI開発',
]

const TECH_NAMES = [
  'AWS Serverless',
  'Cloudflare',
  'Next.js',
  'React',
  'Stripe',
  'WordPress',
  'CircleCI',
  'GitHub Actions',
  'MCP',
  'Claude Code',
]

describe('StackShowcase', () => {
  it('英語版で6カテゴリの見出しを描画する', () => {
    render(<StackShowcase lang="en" />)
    for (const category of EN_CATEGORIES) {
      expect(screen.getByText(category)).toBeInTheDocument()
    }
  })

  it('日本語版で6カテゴリの見出しを描画する', () => {
    render(<StackShowcase lang="ja" />)
    for (const category of JA_CATEGORIES) {
      expect(screen.getByText(category)).toBeInTheDocument()
    }
  })

  it('全ての技術名を描画する', () => {
    render(<StackShowcase lang="en" />)
    for (const name of TECH_NAMES) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('Stripe カードが revtrona.com への外部リンクになっている', () => {
    render(<StackShowcase lang="en" />)
    const link = screen.getByRole('link', { name: /Stripe/ })
    expect(link).toHaveAttribute('href', 'https://revtrona.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
