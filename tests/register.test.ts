import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Register from '../src/routes/register/+page.svelte';
import { goto } from '$app/navigation';
import { vi } from 'vitest';

// Mocking $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-up form correctly', () => {
    render(Register);
    
    expect(screen.getByTestId('signup-title')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should show all validation errors when form is empty', async () => {
    render(Register);
    
    await fireEvent.submit(screen.getByTestId('register-form'));
    
    await waitFor(() => {
      expect(screen.getByTestId('firstName-error')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('lastName-error')).toHaveTextContent('Surname is required');
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });

  it('should show error for invalid email format', async () => {
    render(Register);

    await fireEvent.input(screen.getByTestId('email-input'), { target: { value: 'invalid-email' } });
    
    await fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email not valid');
    });
  });

  it('should show error for short password', async () => {
    render(Register);

    await fireEvent.input(screen.getByTestId('password-input'), { target: { value: 'short' } });
    
    await fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password has to be long at least 8 characters');
    });
  });

  it('should show error when passwords do not match', async () => {
    render(Register);

    await fireEvent.input(screen.getByTestId('password-input'), { target: { value: 'Password123' } });
    await fireEvent.input(screen.getByTestId('confirmPassword-input'), { target: { value: 'DifferentPassword123' } });
    
    await fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(screen.getByTestId('confirmPassword-error')).toHaveTextContent('The passwords inserted do not match');
    });
  });

  it('should submit form successfully with valid data', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'User created successfully' })
    });

    render(Register);
    
    await fireEvent.input(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
    await fireEvent.input(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
    await fireEvent.input(screen.getByTestId('email-input'), { target: { value: 'john.doe@example.com' } });
    await fireEvent.input(screen.getByTestId('password-input'), { target: { value: 'Password123' } });
    await fireEvent.input(screen.getByTestId('confirmPassword-input'), { target: { value: 'Password123' } });

    await fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-success')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(goto).toHaveBeenCalledWith('/login');
    }, { timeout: 2500 });
  });

  it('should handle server error response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already exists' })
    });

    render(Register);
    
    await fireEvent.input(screen.getByTestId('firstName-input'), { target: { value: 'John' } });
    await fireEvent.input(screen.getByTestId('lastName-input'), { target: { value: 'Doe' } });
    await fireEvent.input(screen.getByTestId('email-input'), { target: { value: 'john.doe@example.com' } });
    await fireEvent.input(screen.getByTestId('password-input'), { target: { value: 'Password123' } });
    await fireEvent.input(screen.getByTestId('confirmPassword-input'), { target: { value: 'Password123' } });

    await fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toHaveTextContent('Email already exists');
    });
  });
});