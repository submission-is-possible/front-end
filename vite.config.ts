import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      //'$app': path.resolve(__dirname, '.svelte-kit/runtime/app'),
      '$lib': path.resolve(__dirname, './src/lib'),
      '$routes': path.resolve(__dirname, './src/routes')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    deps: {
      inline: [/^@sveltejs/]
    }
  }
});