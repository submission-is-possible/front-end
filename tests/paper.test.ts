import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import PaperDetailPage from '../src/routes/paper/[id]/+page.svelte';
import { vi } from 'vitest';
import { paper } from '$stores/paperStore';
import { conference } from '$stores/conferenceStore';
import { Role } from '$lib/models/role';
import { writable } from 'svelte/store';

// Mock degli store e delle API
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

vi.mock('$stores/paperStore', () => ({
    paper: {
        subscribe: vi.fn((callback) => {
            callback({
                id: 1,
                title: 'Mock Paper',
                author: 'Mock Author',
                paper_file: '/path/to/mock-paper.pdf',
            });
            return { unsubscribe: vi.fn() }; // Assicurati di restituire un oggetto con unsubscribe
        }),
    },
}));

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


global.fetch = vi.fn();


describe('PaperDetailPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    it('displays the paper details for admins', async () => {
        render(PaperDetailPage, { data: {} });

        expect(await screen.findByText('Mock Paper')).toBeInTheDocument();
        expect(screen.getByText('Mock Author')).toBeInTheDocument();
        expect(screen.getByText('Scarica Paper')).toBeInTheDocument();
    });

    it('fetches and displays reviewers', async () => {
        // Mock della risposta di fetch per ottenere i revisori
        vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
            reviewers: [
                { id: 1, name: 'John Doe', email: 'john@example.com', rating: '9/10' },
            ],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

        render(PaperDetailPage, { data: {} });

        await waitFor(() => expect(fetch).toHaveBeenCalledWith('http://localhost:8000/reviewers/1', expect.anything()));

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('9/10')).toBeInTheDocument();
    });

    it('adds a reviewer correctly', async () => {
        // Mock della risposta di fetch per aggiungere un revisore
        vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
            reviewers: [
                { id: 2, name: 'Jane Doe', email: 'jane@example.com', rating: '-' },
            ],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

        render(PaperDetailPage, { data: {} });

        const emailInput = screen.getByPlaceholderText('Email revisore');
        const addButton = screen.getByText('Aggiungi');

        // Simula l'inserimento dell'email e clicca sul pulsante per aggiungere
        await fireEvent.input(emailInput, { target: { value: 'jane@example.com' } });
        await fireEvent.click(addButton);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8000/reviewers/add/',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ paper_id: 1, email: 'jane@example.com' }),
            })
        );
    });    
    
});