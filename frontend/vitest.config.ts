import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: [
          'src/**/*.{vue,ts}'
        ],
        exclude: [
          'src/main.ts',
          'src/router.ts',
          'src/config/**',
          'src/types/**',
          'src/**/*.d.ts',
          'src/**/*.spec.{js,ts}',
          'src/**/*.test.{js,ts}',
          'src/**/__tests__/**',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        },
        reportsDirectory: './coverage'
      }
    },
  }),
)
