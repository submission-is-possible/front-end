import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import PaperDetailPage from '../src/routes/paper/[id]/+page.svelte';
import { vi } from 'vitest';
import { paper } from '$stores/paperStore';
import { conference } from '$stores/conferenceStore';
import { Role } from '$lib/models/role';
import { writable } from 'svelte/store';

// Mock degli store e delle API
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

vi.mock('$stores/conferenceStore', () => ({
    conference: {
        subscribe: vi.fn((callback) => {
            callback({
                id: 1,
                roles: [Role.Admin],
            });
            return { unsubscribe: vi.fn() }; // Aggiungi anche l'unsubscribe qui
        }),
    },
}));


vi.mock('$stores/paperStore', () => ({
    paper: {
        subscribe: vi.fn((callback) => {
            callback({
                id: 1,
                title: 'Mock Paper',
                role : Role.Admin,
            });
            return { unsubscribe: vi.fn() };
        }),
    },
}));

vi.mock('$stores/userStore', () => ({
    paper: {
        subscribe: vi.fn((callback) => {
            callback({
                id: 1
            });
            return { unsubscribe: vi.fn() };
        }),
    },
}));


global.fetch = vi.fn();


describe('PaperDetailPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    it('displays the paper details for admins', async () => {
        render(PaperDetailPage, { data: {} });

        expect(await screen.findByText('Mock Paper')).toBeInTheDocument();
        expect(screen.getByText('Scarica Paper')).toBeInTheDocument();
    });

    it('fetches and displays reviewers', async () => {
        // Mock della risposta di fetch per ottenere i revisori
        vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
            reviewers: [
                { id: 1, first_name: 'John', email: 'john@example.com'},
            ],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

        render(PaperDetailPage, { data: {} });

        await waitFor(() => expect(fetch).toHaveBeenCalledWith('http://localhost:8000/assign_paper_reviewers/get_reviewers/paper/1/conference/1', expect.anything()));

        expect(await screen.findByText('John')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  
});