import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/component-setup.ts'],
    include: ['**/*.component.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/components/**/*.{ts,tsx}'],
      exclude: [
        'src/components/**/*.component.test.{ts,tsx}',
        'src/components/**/*.stories.{ts,tsx}',
        'src/components/**/index.{ts,tsx}',
      ],
      // Future: Gradually increase thresholds as more tests are added
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
      //   statements: 80,
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
