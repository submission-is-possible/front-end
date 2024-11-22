import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import CreateNewConference from '../src/routes/conference/create-new/+page.svelte';
import { goto } from '$app/navigation';

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe("fetch conference list", () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should validate the create conference form', async () => {
        render(CreateNewConference);
            
        await fireEvent.submit(screen.getByTestId('create-button'));
        
        await waitFor(() => {
            expect(screen.getByTestId('title-error')).toBeVisible();
            expect(screen.getByTestId('description-error')).toBeVisible();
            //expect(screen.getByTestId('date-error')).toBeVisible();
        });
    });

    it('should navigate back to conference page', async () => {
        render(CreateNewConference);

        await fireEvent.click(screen.getByTestId('back-to-conferences-button'));
        expect(goto).toHaveBeenCalledWith('/conference');
    })

    it('should show an error message when cant create conference', async () => {
        window.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error:'error message' })
          });

        render(CreateNewConference);

        await fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'test1' } });
        await fireEvent.input(screen.getByTestId('description-input'), { target: { value: 'test1' } });
        await fireEvent.input(screen.getByTestId('date-input'), { target: { value: '9999-01-01' } });

        await fireEvent.submit(screen.getByTestId('create-button'));

        await waitFor( () => {
            expect(screen.getByTestId('conference-creation-error')).toHaveTextContent('error message')
        });

    })

    it('shoud show a success message on conferene creation', async () => {
        window.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: 'success'})
          });
        
          render(CreateNewConference);
    });
});
