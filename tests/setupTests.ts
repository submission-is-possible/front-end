import { cleanup } from '@testing-library/svelte';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers'; // Corrected import
import { vi } from 'vitest';
import { readable, writable } from 'svelte/store';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock SvelteKit's $app modules
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
  version: 'any'
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn(),
  onNavigate: vi.fn()
}));

// Create mock stores
const createMockStore = (value: any) => {
  const store = writable(value);
  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update
  };
};

vi.mock('$app/stores', () => {
  const page = createMockStore({
    url: new URL('http://localhost'),
    params: {},
    route: { id: null },
    status: 200,
    error: null,
    data: {},
    form: undefined
  });

  const navigating = createMockStore(null);

  return {
    page,
    navigating,
    updated: readable(false),
    getStores: vi.fn().mockImplementation(() => ({
      page,
      navigating,
      updated: readable(false)
    }))
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Suppress console errors during tests
const consoleError = vi.spyOn(console, 'error');
beforeAll(() => {
  consoleError.mockImplementation(() => {});
});

afterAll(() => {
  consoleError.mockRestore();
});