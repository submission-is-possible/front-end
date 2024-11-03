import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './src/lib'),
      '$routes': path.resolve(__dirname, './src/routes'),
      ...(process.env.VITEST ? {
        '$app': path.resolve(__dirname, './tests/mocks/app')
      } : {})
    },
    conditions: mode === 'test' ? ['browser'] : [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}', 'tests/**/*.test.{js,ts}', 'tests/**/*.spec.{js,ts}'],
    deps: {
      inline: [/^svelte/, /@testing-library\/svelte/]
    },
    typecheck: {
      enabled: true
    },
    passWithNoTests: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true
  }
}));
