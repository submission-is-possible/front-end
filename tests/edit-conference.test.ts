import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditConference from '../src/routes/conference/edit/+page.svelte';
import { goto } from '$app/navigation';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock dependencies
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$stores/userStore', () => ({
  user: {
    subscribe: vi.fn((fn) => {
      fn({ id: 1 });
      return () => {};
    }),
  },
}));

// Mock conference data
const mockConference = {
  id: 123,
  title: 'Test Conference',
  description: 'Test Description',
  deadline: '2024-12-31',
  admin_id: 1,
  created_at: '2024-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch; // Riassigna global.fetch a mockFetch
  mockFetch.mockReset();

  // Set window.location.search to include id=123
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      href: 'http://localhost/conference/edit?id=123',
      search: '?id=123',
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
      toString: () => 'http://localhost/conference/edit?id=123',
    },
  });

  // Mock the initial fetch response for loading the conference data
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockConference,
  });
});

describe('EditConference', () => {
  it('should load and display conference data', async () => {
    render(EditConference);

    // Verify that the loading spinner is shown initially
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });
  });

  it('should show error message when conference loading fails', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to load conference data' })
    });

    render(EditConference);

    await waitFor(() => {
      expect(screen.getByText('Failed to load conference data')).toBeInTheDocument();
    });
  });

  it('should validate form fields before submission', async () => {
    render(EditConference);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
    });

    // Clear required fields
    const titleInput = screen.getByTestId('title-input');
    const descriptionInput = screen.getByTestId('description-input');

    await fireEvent.input(titleInput, { target: { value: '' } });
    await fireEvent.input(descriptionInput, { target: { value: '' } });

    // Attempt to submit the form
    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    // Verify that error messages are displayed
    expect(screen.getByTestId('title-error')).toBeInTheDocument();
    expect(screen.getByTestId('description-error')).toBeInTheDocument();
  });

  it('should successfully update conference and redirect', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConference
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Conference updated successfully' })
      });

    render(EditConference);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
    });

    // Modify some fields
    const titleInput = screen.getByTestId('title-input');
    await fireEvent.input(titleInput, { target: { value: 'Updated Conference' } });

    // Submit the form
    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    // Verify that the PATCH request was made correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/conference/123/',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conference_id: 123,
            title: 'Updated Conference',
            deadline: '2024-12-31',
            description: 'Test Description',
            user_id: 1
          }),
        })
      );
    });

    // Verify success message
    expect(screen.getByText('Conference updated successfully! Redirecting...')).toBeInTheDocument();

    // Verify redirection
    await waitFor(() => {
      expect(goto).toHaveBeenCalledWith('/conference');
    });
  });

  it('should handle server errors during update', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConference,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Permission denied' }),
      });

    render(EditConference);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    // Verify that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument();
    });
  });

  it('should navigate back when cancel button is clicked', async () => {
    render(EditConference);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
    });

    // Click the cancel button
    const cancelButton = screen.getByTestId('cancel-button');
    await fireEvent.click(cancelButton);

    expect(goto).toHaveBeenCalledWith('/conference');
  });

  it('should validate deadline is in the future', async () => {
    render(EditConference);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Conference')).toBeInTheDocument();
    });

    // Set a past date
    const deadlineInput = screen.getByTestId('deadline-input');
    await fireEvent.input(deadlineInput, { target: { value: '2023-01-01' } });

    // Submit the form
    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    // Verify that the deadline error message is displayed
    expect(screen.getByTestId('deadline-error')).toBeInTheDocument();
  });
});

// Test form validation utilities
describe('Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch; // Riassigna global.fetch a mockFetch
    mockFetch.mockReset();

    // Set window.location.search to include id=123
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost/conference/edit?id=123',
        search: '?id=123',
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
        toString: () => 'http://localhost/conference/edit?id=123',
      },
    });

    // Mock the initial fetch response for loading the conference data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConference,
    });
  });

  it('should validate title is not empty', async () => {
    render(EditConference);

    await waitFor(() => {
      expect(screen.getByTestId('title-input')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('title-input');
    await fireEvent.input(titleInput, { target: { value: '   ' } });

    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    expect(screen.getByTestId('title-error')).toBeInTheDocument();
  });

  it('should validate description is not empty', async () => {
    render(EditConference);

    await waitFor(() => {
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByTestId('description-input');
    await fireEvent.input(descriptionInput, { target: { value: '   ' } });

    const submitButton = screen.getByTestId('save-button');
    await fireEvent.click(submitButton);

    expect(screen.getByTestId('description-error')).toBeInTheDocument();
  });
});
