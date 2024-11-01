import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup global fetch mock
global.fetch = vi.fn();

// Mock SvelteKit's $app modules
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

vi.mock('$app/stores', () => ({
  navigating: vi.fn(),
  page: vi.fn(),
  navigating$: {
    subscribe: vi.fn()
  },
  page$: {
    subscribe: vi.fn()
  }
}));

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});