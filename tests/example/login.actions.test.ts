import { describe, it, expect, vi } from 'vitest';
import { actions } from "../../src/routes/login/+page.server";
import { fail, redirect } from '@sveltejs/kit';

vi.mock('@sveltejs/kit', () => ({
  fail: vi.fn(),
  redirect: vi.fn(),
}));

describe('Login Actions', () => {
  it('fallisce se email o password sono mancanti', async () => {
    const response = await actions.default({
      request: new Request('https://example.com', { method: 'POST', body: new URLSearchParams() }),
      cookies: new Map(),
    });

    expect(fail).toHaveBeenCalledWith(400, { email: undefined, error: 'Email and password are required' });
  });
});
