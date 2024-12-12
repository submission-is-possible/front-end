// src/routes/conference/[id]/test_+page.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import ConferencePage from '../src/routes/conference/detail/[id]/+page.svelte';
import { user } from '$stores/userStore';
import { get } from 'svelte/store';
import { Conference } from '$lib/models/conference';
import { Role } from '$lib/models/role';
import { conference } from '$stores/conferenceStore';

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

const mockConference : Conference = {
  id: 1,
  title: 'Test Conference',
  description: 'Test Description',
  created_at: new Date,
  deadline: new Date,
  papers_deadline: new Date,
  roles: [Role.Admin],
  user_id: 1,
  status: 'none'
};

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  isLoggedin: true
};

describe('Conference Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user.set(mockUser);
    conference.set(mockConference);
    global.fetch = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  

  it('allows editing when user is conference creator', async () => {
    render(ConferencePage);

    await waitFor(() => {
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('edit-button'));
    expect(screen.getByTestId('edit-conference-form')).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    render(ConferencePage);

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('edit-button'));
    });

    const titleInput = screen.getByTestId('title-input');
    await fireEvent.input(titleInput, { target: { value: '' } });
    
    await fireEvent.submit(screen.getByTestId('edit-conference-form'));
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });
/*
  it('handles successful conference update', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve(mockConference) };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    render(ConferencePage);

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('edit-button'));
    });

    await fireEvent.submit(screen.getByTestId('edit-conference-form'));

    expect(global.fetch).toHaveBeenCalledOnce();
  });
*/
  it('handles conference deletion', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    global.confirm = vi.fn(() => true);

    render(ConferencePage);

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-button'));
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/conference/delete/',
      expect.any(Object)
    );
    expect(goto).toHaveBeenCalledWith('/conference');
  });



  it('navigates back to conference list', async () => {
    render(ConferencePage);

    await fireEvent.click(screen.getByTestId('back-to-conferences-button'));
    expect(goto).toHaveBeenCalledWith('/conference');
  });

  
});