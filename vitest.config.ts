import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/libs/**/*.ts'],
      exclude: [
        'src/libs/**/*.test.ts',
        'src/libs/microCMS/mocks.ts',
        'src/libs/microCMS/types.ts',
        'src/libs/dataSources/types.ts',
      ],
      // Phase 1: Start with tested files only
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
