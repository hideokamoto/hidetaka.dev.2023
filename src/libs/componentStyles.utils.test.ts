import { describe, expect, it } from 'vitest'
import {
  getBadgeStyles,
  getSectionHeaderAlignStyles,
  getTagSizeStyles,
  getTagStyles,
  getTagVariantStyles,
  type TagSize,
  type TagVariant,
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

  describe('getTagSizeStyles', () => {
    it('should return correct styles for "sm" size', () => {
      const styles = getTagSizeStyles('sm')
      expect(styles).toContain('px-2.5')
      expect(styles).toContain('py-1')
      expect(styles).toContain('text-xs')
    })

    it('should return correct styles for "md" size', () => {
      const styles = getTagSizeStyles('md')
      expect(styles).toContain('px-3')
      expect(styles).toContain('py-1.5')
      expect(styles).toContain('text-xs')
    })

    it('should return non-empty string for all sizes', () => {
      expect(getTagSizeStyles('sm').length).toBeGreaterThan(0)
      expect(getTagSizeStyles('md').length).toBeGreaterThan(0)
    })
  })

  describe('getTagVariantStyles', () => {
    it('should return correct styles for "default" variant', () => {
      const styles = getTagVariantStyles('default')
      expect(styles).toContain('bg-slate-100')
      expect(styles).toContain('text-slate-600')
      expect(styles).toContain('dark:bg-slate-800')
      expect(styles).toContain('dark:text-slate-400')
    })

    it('should return correct styles for "purple" variant', () => {
      const styles = getTagVariantStyles('purple')
      expect(styles).toContain('bg-purple-100')
      expect(styles).toContain('text-purple-700')
      expect(styles).toContain('dark:bg-purple-500/20')
      expect(styles).toContain('dark:text-purple-400')
    })

    it('should return correct styles for "indigo" variant', () => {
      const styles = getTagVariantStyles('indigo')
      expect(styles).toContain('bg-indigo-100')
      expect(styles).toContain('text-indigo-700')
      expect(styles).toContain('dark:bg-indigo-500/20')
      expect(styles).toContain('dark:text-indigo-400')
    })

    it('should return non-empty string for all variants', () => {
      expect(getTagVariantStyles('default').length).toBeGreaterThan(0)
      expect(getTagVariantStyles('purple').length).toBeGreaterThan(0)
      expect(getTagVariantStyles('indigo').length).toBeGreaterThan(0)
    })

    it('should include dark mode styles for all variants', () => {
      expect(getTagVariantStyles('default')).toContain('dark:')
      expect(getTagVariantStyles('purple')).toContain('dark:')
      expect(getTagVariantStyles('indigo')).toContain('dark:')
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

    it('should return correct combined styles for all combinations', () => {
      const combinations: Array<{
        variant: TagVariant
        size: TagSize
      }> = [
        { variant: 'default', size: 'sm' },
        { variant: 'default', size: 'md' },
        { variant: 'purple', size: 'sm' },
        { variant: 'purple', size: 'md' },
        { variant: 'indigo', size: 'sm' },
        { variant: 'indigo', size: 'md' },
      ]

      for (const { variant, size } of combinations) {
        const styles = getTagStyles(variant, size)
        expect(styles.size).toBe(getTagSizeStyles(size))
        expect(styles.variant).toBe(getTagVariantStyles(variant))
      }
    })

    it('should correctly combine small size with purple variant', () => {
      const styles = getTagStyles('purple', 'sm')
      expect(styles.size).toContain('px-2.5')
      expect(styles.variant).toContain('bg-purple-100')
    })

    it('should correctly combine medium size with indigo variant', () => {
      const styles = getTagStyles('indigo', 'md')
      expect(styles.size).toContain('px-3')
      expect(styles.variant).toContain('bg-indigo-100')
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
})
