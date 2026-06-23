import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StackShowcase from '@/components/home/StackShowcase'

describe('StackShowcase', () => {
  describe('Card count', () => {
    it('renders 6 cards for lang="en"', () => {
      const { container } = render(<StackShowcase lang="en" />)
      expect(container.querySelectorAll('h3')).toHaveLength(6)
    })

    it('renders 6 cards for lang="ja"', () => {
      const { container } = render(<StackShowcase lang="ja" />)
      expect(container.querySelectorAll('h3')).toHaveLength(6)
    })
  })

  describe('All 6 names appear', () => {
    it('shows all 6 stack names in English', () => {
      render(<StackShowcase lang="en" />)
      expect(screen.getByText('Stripe')).toBeInTheDocument()
      expect(screen.getByText('AWS Serverless')).toBeInTheDocument()
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
      expect(screen.getByText('WordPress')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
      expect(screen.getByText('AI Development')).toBeInTheDocument()
    })

    it('shows all 6 stack names in Japanese', () => {
      render(<StackShowcase lang="ja" />)
      expect(screen.getByText('Stripe')).toBeInTheDocument()
      expect(screen.getByText('AWS Serverless')).toBeInTheDocument()
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
      expect(screen.getByText('WordPress')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
      expect(screen.getByText('AI Development')).toBeInTheDocument()
    })
  })

  describe('Language-dependent description for AI Development', () => {
    it('shows Japanese description for lang="ja"', () => {
      render(<StackShowcase lang="ja" />)
      expect(screen.getByText('Claude / OpenAI / MCP')).toBeInTheDocument()
    })

    it('shows English description for lang="en"', () => {
      render(<StackShowcase lang="en" />)
      expect(screen.getByText('Claude · OpenAI · MCP')).toBeInTheDocument()
    })
  })
})
