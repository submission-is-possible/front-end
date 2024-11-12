import MyConferences from '../src/routes/conference/+page.svelte';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe('My Conferences component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch conferences and render them in table view', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        conferences: [
          { id: 1, title: 'Test Conference 1', description: 'Description 1', created_at: '2024-11-01', deadline: '2024-12-01', roles: [] },
          { id: 2, title: 'Test Conference 2', description: 'Description 2', created_at: '2024-11-02', deadline: '2024-12-02', roles: [] },
        ],
        current_page: 1,
        total_pages: 1,
        total_conferences: 2
      })
    });

    render(MyConferences);

    await waitFor(() => {
      expect(screen.getByText('Test Conference 1')).toBeInTheDocument();
      expect(screen.getByText('Test Conference 2')).toBeInTheDocument();
    });

    // Aggiungi questa verifica per la paginazione
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  
  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch conferences' })
    });

    render(MyConferences);

    await waitFor(() => {
      expect(screen.queryByText('Failed to fetch conferences')).not.toBeInTheDocument();
    });
  });
});
