/**
 * ArticleCTA コンポーネントのテスト
 *
 * ユニットテストとプロパティベーステストの両方を含みます。
 */

import { render, screen } from '@testing-library/react'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { CTA_PATTERNS } from '@/libs/ctaPatterns'
import type { ArticleType, CTAData } from '@/libs/ctaTypes'
import ArticleCTA from './ArticleCTA'

describe('ArticleCTA', () => {
  describe('Unit Tests', () => {
    describe('Pattern Selection', () => {
      it('should display tutorial pattern for tutorial article type', () => {
        render(<ArticleCTA articleType="tutorial" lang="ja" />)

        expect(screen.getByText('学んだことを実践してみましょう')).toBeInTheDocument()
        expect(
          screen.getByText(
            'このチュートリアルで学んだ技術を自分のプロジェクトで試してみませんか？',
          ),
        ).toBeInTheDocument()
      })

      it('should display essay pattern for essay article type', () => {
        render(<ArticleCTA articleType="essay" lang="ja" />)

        expect(screen.getByText('さらに深く探求する')).toBeInTheDocument()
        expect(
          screen.getByText(
            'このトピックに興味を持ちましたか？関連する記事やプロジェクトをご覧ください。',
          ),
        ).toBeInTheDocument()
      })

      it('should display tool_announcement pattern for tool_announcement article type', () => {
        render(<ArticleCTA articleType="tool_announcement" lang="ja" />)

        expect(screen.getByText('今すぐ試してみる')).toBeInTheDocument()
        expect(
          screen.getByText('このツールを実際に使ってみて、あなたのワークフローを改善しましょう。'),
        ).toBeInTheDocument()
      })

      it('should display general pattern for general article type', () => {
        render(<ArticleCTA articleType="general" lang="ja" />)

        expect(screen.getByText('次に読む')).toBeInTheDocument()
        expect(screen.getByText('他の記事やプロジェクトもぜひご覧ください。')).toBeInTheDocument()
      })

      it('should display general pattern when articleType is undefined', () => {
        render(<ArticleCTA lang="ja" />)

        expect(screen.getByText('次に読む')).toBeInTheDocument()
        expect(screen.getByText('他の記事やプロジェクトもぜひご覧ください。')).toBeInTheDocument()
      })
    })

    describe('Language Switching', () => {
      it('should display Japanese content when lang is "ja"', () => {
        render(<ArticleCTA articleType="tutorial" lang="ja" />)

        expect(screen.getByText('学んだことを実践してみましょう')).toBeInTheDocument()
        expect(screen.getByText('関連記事を読む')).toBeInTheDocument()
      })

      it('should display English content when lang is "en"', () => {
        render(<ArticleCTA articleType="tutorial" lang="en" />)

        expect(screen.getByText('Put What You Learned Into Practice')).toBeInTheDocument()
        expect(screen.getByText('Read More Articles')).toBeInTheDocument()
      })
    })

    describe('Custom CTA Data', () => {
      it('should use custom ctaData when provided and valid', () => {
        const customData: CTAData = {
          heading: 'Custom Heading',
          description: 'Custom description text',
          buttons: [
            { text: 'Custom Button 1', href: '/custom1', variant: 'primary' },
            { text: 'Custom Button 2', href: '/custom2', variant: 'secondary' },
          ],
        }

        render(<ArticleCTA articleType="tutorial" lang="ja" ctaData={customData} />)

        expect(screen.getByText('Custom Heading')).toBeInTheDocument()
        expect(screen.getByText('Custom description text')).toBeInTheDocument()
        expect(screen.getByText('Custom Button 1')).toBeInTheDocument()
        expect(screen.getByText('Custom Button 2')).toBeInTheDocument()
      })

      it('should fallback to pattern when ctaData is invalid', () => {
        const invalidData = {
          heading: 'Invalid',
          // missing description and buttons
        } as unknown as CTAData

        render(<ArticleCTA articleType="tutorial" lang="ja" ctaData={invalidData} />)

        // Should display tutorial pattern instead
        expect(screen.getByText('学んだことを実践してみましょう')).toBeInTheDocument()
      })
    })

    describe('Semantic HTML and Accessibility', () => {
      it('should use semantic section element', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        expect(section).toBeInTheDocument()
      })

      it('should have aria-label on section', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        expect(section).toHaveAttribute('aria-label', 'アクションを促すセクション')
      })

      it('should have localized aria-label on section for English', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="en" />)

        const section = container.querySelector('section')
        expect(section).toHaveAttribute('aria-label', 'Call to action')
      })

      it('should have role attribute on section', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        expect(section).toHaveAttribute('role', 'complementary')
      })

      it('should use h2 for heading', () => {
        render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const heading = screen.getByRole('heading', { level: 2 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('学んだことを実践してみましょう')
      })

      it('should use nav element for buttons', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const nav = container.querySelector('nav')
        expect(nav).toBeInTheDocument()
        expect(nav).toHaveAttribute('aria-label', 'CTAアクション')
      })

      it('should have localized aria-label on nav for English', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="en" />)

        const nav = container.querySelector('nav')
        expect(nav).toHaveAttribute('aria-label', 'CTA actions')
      })
    })

    describe('Styling', () => {
      it('should apply custom className', () => {
        const { container } = render(
          <ArticleCTA articleType="tutorial" lang="ja" className="custom-class" />,
        )

        const section = container.querySelector('section')
        expect(section).toHaveClass('custom-class')
      })

      it('should have dark mode classes', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        expect(section?.className).toContain('dark:')
      })

      it('should have responsive breakpoint classes', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        const sectionClasses = section?.className || ''

        // Check for sm: breakpoint classes
        expect(sectionClasses).toContain('sm:')

        // Check for md: breakpoint classes
        expect(sectionClasses).toContain('md:')

        // Check for lg: breakpoint classes
        expect(sectionClasses).toContain('lg:')
      })

      it('should have proper spacing classes', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        const sectionClasses = section?.className || ''

        // Check for margin and padding classes
        expect(sectionClasses).toMatch(/my-\d+/)
        expect(sectionClasses).toMatch(/p-\d+/)
      })

      it('should have shadow and transition classes', () => {
        const { container } = render(<ArticleCTA articleType="tutorial" lang="ja" />)

        const section = container.querySelector('section')
        const sectionClasses = section?.className || ''

        // Check for shadow classes
        expect(sectionClasses).toContain('shadow')

        // Check for transition classes
        expect(sectionClasses).toContain('transition')
      })
    })
  })

  describe('Property-Based Tests', () => {
    it('Property 1: Article type and CTA pattern mapping', () => {
      // Feature: article-cta-component, Property 1: 記事タイプとCTAパターンのマッピング
      // **Validates: Requirements 1.1, 1.5**

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('tutorial' as ArticleType),
            fc.constant('essay' as ArticleType),
            fc.constant('tool_announcement' as ArticleType),
            fc.constant('general' as ArticleType),
            fc.constant(undefined),
          ),
          fc.oneof(fc.constant('ja' as const), fc.constant('en' as const)),
          (articleType, lang) => {
            const { container, unmount } = render(
              <ArticleCTA articleType={articleType} lang={lang} />,
            )

            // 正しいパターンが表示されることを検証
            const expectedType = articleType || 'general'
            const expectedPattern = CTA_PATTERNS[expectedType][lang]

            // 見出しが表示されている
            const heading = container.querySelector('h2')
            expect(heading?.textContent).toBe(expectedPattern.heading)

            // 説明が表示されている
            const description = container.querySelector('p')
            expect(description?.textContent).toBe(expectedPattern.description)

            // ボタンが正しい数だけ表示されている
            const buttons = container.querySelectorAll('nav a')
            expect(buttons).toHaveLength(expectedPattern.buttons.length)

            // 各ボタンのテキストが正しい
            expectedPattern.buttons.forEach((button, index) => {
              const buttonElement = buttons[index]
              expect(buttonElement?.textContent).toContain(button.text)
            })

            // クリーンアップ
            unmount()
          },
        ),
        { numRuns: 100 },
      )
    })

    it('Property 2: Language-based localization', () => {
      // Feature: article-cta-component, Property 2: 言語ベースのローカライゼーション
      // **Validates: Requirements 2.1, 2.2**

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('tutorial' as ArticleType),
            fc.constant('essay' as ArticleType),
            fc.constant('tool_announcement' as ArticleType),
            fc.constant('general' as ArticleType),
          ),
          fc.oneof(fc.constant('ja' as const), fc.constant('en' as const)),
          (articleType, lang) => {
            const { container, unmount } = render(
              <ArticleCTA articleType={articleType} lang={lang} />,
            )

            // 指定された言語のコンテンツが表示されることを検証
            const pattern = CTA_PATTERNS[articleType][lang]

            const heading = container.querySelector('h2')
            expect(heading?.textContent).toBe(pattern.heading)

            const description = container.querySelector('p')
            expect(description?.textContent).toBe(pattern.description)

            const buttons = container.querySelectorAll('nav a')
            pattern.buttons.forEach((button, index) => {
              const buttonElement = buttons[index]
              expect(buttonElement?.textContent).toContain(button.text)
            })

            // クリーンアップ
            unmount()
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
