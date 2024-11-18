import NotificationsPage from '../src/routes/notifications/+page.svelte';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';

describe('Notifications Page', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
    });
        
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('renders notifications table and pagination', async () => {
        // Mock della risposta API per fetchNotifications
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                notifications: [
                    {
                        id: 1,
                        sender: 'User1',
                        conference: {
                            id: 101,
                            title: 'Conference 101',
                            description: 'Description',
                            created_at: '2024-11-10T12:00:00Z',
                            deadline: '2024-12-01T12:00:00Z',
                            roles: ['admin'],
                        },
                        status: 'pending',
                    },
                ],
                current_page: 1,
                total_pages: 3,
            }),
        });

        render(NotificationsPage);

        // Attendi che la tabella venga popolata
        expect(await screen.findByText('User1')).toBeInTheDocument();
        expect(screen.getByText('Conference 101')).toBeInTheDocument();
        expect(screen.getByText('Deadline: 01/12/2024')).toBeInTheDocument();

        // Controlla elementi di paginazione
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('handles Accept action correctly', async () => {
        // Mock della risposta API
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                notifications: [
                    {
                        id: 1,
                        sender: 'User1',
                        conference: {
                            id: 101,
                            title: 'Conference 101',
                            description: 'Description',
                            created_at: '2024-11-10T12:00:00Z',
                            deadline: '2024-12-01T12:00:00Z',
                            roles: ['admin'],
                        },
                        status: 'pending',
                    },
                ],
                current_page: 1,
                total_pages: 3,
            }),
        });

        // Mock della chiamata PATCH
        mockFetch.mockResolvedValueOnce({ ok: true });

        render(NotificationsPage);

        // Attendi che i dati vengano renderizzati
        const acceptButton = await screen.findByText('Accept');
        await fireEvent.click(acceptButton);

        // Controlla la chiamata a fetch
        expect(mockFetch).toHaveBeenCalledWith(
            '/notifications/update-notification/',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ id_notification: 1, status: 'accept' }),
            })
        );

        // Verifica che lo stato venga aggiornato localmente
        expect(screen.queryByText('Accept')).not.toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    test('handles Decline action correctly', async () => {
        // Mock della risposta API
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                notifications: [
                    {
                        id: 1,
                        sender: 'User1',
                        conference: {
                            id: 101,
                            title: 'Conference 101',
                            description: 'Description',
                            created_at: '2024-11-10T12:00:00Z',
                            deadline: '2024-12-01T12:00:00Z',
                            roles: ['admin'],
                        },
                        status: 'pending',
                    },
                ],
                current_page: 1,
                total_pages: 3,
            }),
        });

        // Mock della chiamata PATCH
        mockFetch.mockResolvedValueOnce({ ok: true });

        render(NotificationsPage);

        // Attendi che i dati vengano renderizzati
        const declineButton = await screen.findByText('Decline');
        await fireEvent.click(declineButton);

        // Controlla la chiamata a fetch
        expect(mockFetch).toHaveBeenCalledWith(
            '/notifications/update-notification/',
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ id_notification: 1, status: 'reject' }),
            })
        );

        // Verifica che lo stato venga aggiornato localmente
        expect(screen.queryByText('Decline')).not.toBeInTheDocument();
        expect(screen.getByText('Declined')).toBeInTheDocument();
    });

    test('navigates to another page using pagination', async () => {
        // Mock della prima pagina
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                notifications: [
                    {
                        id: 1,
                        sender: 'User1',
                        conference: {
                            id: 101,
                            title: 'Conference 101',
                            description: 'Description',
                            created_at: '2024-11-10T12:00:00Z',
                            deadline: '2024-12-01T12:00:00Z',
                            roles: ['admin'],
                        },
                        status: 'pending',
                    },
                ],
                current_page: 1,
                total_pages: 3,
            }),
        });

        // Mock della seconda pagina
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                notifications: [
                    {
                        id: 11,
                        sender: 'User2',
                        conference: {
                            id: 201,
                            title: 'Conference 201',
                            description: 'Description 201',
                            created_at: '2024-11-10T12:00:00Z',
                            deadline: '2024-12-02T12:00:00Z',
                            roles: ['reviewer'],
                        },
                        status: 'pending',
                    },
                ],
                current_page: 2,
                total_pages: 3,
            }),
        });

        render(NotificationsPage);

        // Vai alla pagina 2
        const nextPageButton = await screen.findByText('2');
        await fireEvent.click(nextPageButton);

        // Verifica che la nuova pagina venga caricata
        expect(await screen.findByText('User2')).toBeInTheDocument();
        expect(screen.getByText('Conference 201')).toBeInTheDocument();
    });
});