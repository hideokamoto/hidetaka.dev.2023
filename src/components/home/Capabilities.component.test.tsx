/**
 * Capabilities コンポーネントのテスト
 *
 * Developer Experience 4軸への刷新内容を検証します。
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Capabilities from '@/components/home/Capabilities'

const EN_TITLES = [
  'Serverless Development',
  'Frontend Development',
  'Developer Tools & Automation',
  'Community & Content',
]

const JA_TITLES = [
  'サーバーレス開発',
  'フロントエンド開発',
  '開発者ツールと自動化',
  'コミュニティとコンテンツ',
]

describe('Capabilities', () => {
  it('英語版で Developer Experience 4軸のカードを描画する', () => {
    render(<Capabilities lang="en" />)
    for (const title of EN_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
    // 代表的な highlight
    expect(screen.getByText('CircleCI pipeline optimization')).toBeInTheDocument()
    expect(screen.getByText('1000+ technical articles')).toBeInTheDocument()
  })

  it('日本語版で4軸のカードを描画する', () => {
    render(<Capabilities lang="ja" />)
    for (const title of JA_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })
})
