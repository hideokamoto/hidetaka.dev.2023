import { describe, expect, it } from 'vitest'
import {
  getBadgeStyles,
  getCTAButtonStyles,
  getSectionHeaderAlignStyles,
  getTagStyles,
} from './componentStyles.utils'

describe('Component Styles Utils', () => {
  describe('getBadgeStyles', () => {
    it('should return correct styles for "default" variant', () => {
      const styles = getBadgeStyles('default')

      expect(styles.variant).toContain('border-zinc-200')
      expect(styles.variant).toContain('bg-zinc-50/80')
      expect(styles.variant).toContain('dark:border-zinc-500/30')

      expect(styles.text).toContain('text-zinc-700')
      expect(styles.text).toContain('dark:text-zinc-400')

      expect(styles.dot).toContain('bg-zinc-500')
      expect(styles.dot).toContain('animate-pulse')
    })

    it('should return correct styles for "indigo" variant', () => {
      const styles = getBadgeStyles('indigo')

      expect(styles.variant).toContain('border-indigo-200')
      expect(styles.variant).toContain('bg-indigo-50/80')
      expect(styles.variant).toContain('dark:border-indigo-500/30')

      expect(styles.text).toContain('text-indigo-700')
      expect(styles.text).toContain('dark:text-indigo-400')

      expect(styles.dot).toContain('bg-indigo-500')
      expect(styles.dot).toContain('animate-pulse')
    })

    it('should return all required style properties', () => {
      const defaultStyles = getBadgeStyles('default')
      expect(defaultStyles).toHaveProperty('variant')
      expect(defaultStyles).toHaveProperty('text')
      expect(defaultStyles).toHaveProperty('dot')

      const indigoStyles = getBadgeStyles('indigo')
      expect(indigoStyles).toHaveProperty('variant')
      expect(indigoStyles).toHaveProperty('text')
      expect(indigoStyles).toHaveProperty('dot')
    })

    it('should have consistent base styles across variants', () => {
      const defaultStyles = getBadgeStyles('default')
      const indigoStyles = getBadgeStyles('indigo')

      // Both should have uppercase
      expect(defaultStyles.text).toContain('uppercase')
      expect(indigoStyles.text).toContain('uppercase')

      // Both should have animate-pulse for dots
      expect(defaultStyles.dot).toContain('animate-pulse')
      expect(indigoStyles.dot).toContain('animate-pulse')
    })
  })

  describe('getTagStyles', () => {
    it('should return both size and variant styles', () => {
      const styles = getTagStyles('default', 'md')
      expect(styles).toHaveProperty('size')
      expect(styles).toHaveProperty('variant')
      expect(styles.size).toBeTruthy()
      expect(styles.variant).toBeTruthy()
    })

    it('should return correct size styles for "sm"', () => {
      const styles = getTagStyles('default', 'sm')
      expect(styles.size).toBe('px-2.5 py-1 text-xs')
    })

    it('should return correct size styles for "md"', () => {
      const styles = getTagStyles('default', 'md')
      expect(styles.size).toBe('px-3 py-1.5 text-xs')
    })

    it('should return correct variant styles for "default"', () => {
      const styles = getTagStyles('default', 'md')
      expect(styles.variant).toBe(
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      )
    })

    it('should return correct variant styles for "purple"', () => {
      const styles = getTagStyles('purple', 'md')
      expect(styles.variant).toBe(
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      )
    })

    it('should return correct variant styles for "indigo"', () => {
      const styles = getTagStyles('indigo', 'md')
      expect(styles.variant).toBe(
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      )
    })

    it('should correctly combine small size with purple variant', () => {
      const styles = getTagStyles('purple', 'sm')
      expect(styles.size).toBe('px-2.5 py-1 text-xs')
      expect(styles.variant).toBe(
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      )
    })

    it('should correctly combine medium size with indigo variant', () => {
      const styles = getTagStyles('indigo', 'md')
      expect(styles.size).toBe('px-3 py-1.5 text-xs')
      expect(styles.variant).toBe(
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      )
    })
  })

  describe('getSectionHeaderAlignStyles', () => {
    it('should return correct styles for "left" alignment', () => {
      const styles = getSectionHeaderAlignStyles('left')
      expect(styles).toBe('text-left')
    })

    it('should return correct styles for "center" alignment', () => {
      const styles = getSectionHeaderAlignStyles('center')
      expect(styles).toBe('text-center')
    })

    it('should return correct styles for "right" alignment', () => {
      const styles = getSectionHeaderAlignStyles('right')
      expect(styles).toBe('text-right')
    })

    it('should return non-empty string for all alignments', () => {
      expect(getSectionHeaderAlignStyles('left').length).toBeGreaterThan(0)
      expect(getSectionHeaderAlignStyles('center').length).toBeGreaterThan(0)
      expect(getSectionHeaderAlignStyles('right').length).toBeGreaterThan(0)
    })

    it('should return text-* class for all alignments', () => {
      expect(getSectionHeaderAlignStyles('left')).toContain('text-')
      expect(getSectionHeaderAlignStyles('center')).toContain('text-')
      expect(getSectionHeaderAlignStyles('right')).toContain('text-')
    })
  })

  describe('getCTAButtonStyles', () => {
    it('should return primary variant styles with base tokens', () => {
      const styles = getCTAButtonStyles('primary')

      // Base tokens
      expect(styles).toContain('inline-flex')
      expect(styles).toContain('gap-2')
      expect(styles).toContain('rounded-lg')
      expect(styles).toContain('px-10')
      expect(styles).toContain('font-bold')

      // Primary variant tokens
      expect(styles).toContain('bg-indigo-600')
      expect(styles).toContain('text-white')
      expect(styles).toContain('hover:bg-indigo-700')
      expect(styles).toContain('dark:bg-indigo-500')
      expect(styles).toContain('dark:hover:bg-indigo-400')
    })

    it('should return secondary variant styles with base tokens', () => {
      const styles = getCTAButtonStyles('secondary')

      // Base tokens
      expect(styles).toContain('inline-flex')
      expect(styles).toContain('gap-2')
      expect(styles).toContain('rounded-lg')
      expect(styles).toContain('px-10')
      expect(styles).toContain('font-bold')

      // Secondary variant tokens
      expect(styles).toContain('border-zinc-200')
      expect(styles).toContain('bg-white')
      expect(styles).toContain('text-zinc-900')
      expect(styles).toContain('hover:bg-zinc-50')
      expect(styles).toContain('dark:border-zinc-700')
      expect(styles).toContain('dark:bg-zinc-900')
      expect(styles).toContain('dark:text-white')
      expect(styles).toContain('dark:hover:bg-zinc-800')
    })
  })
})
