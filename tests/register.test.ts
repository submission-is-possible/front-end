// tests/register.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import Register from '../src/routes/register/+page.svelte';
import { goto } from '$app/navigation';

// Mock del modulo $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

describe('Register Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the registration form with all elements', () => {
      render(Register);
      
      // Verifica presenza elementi principali
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText(/Do you have an account\?/)).toBeInTheDocument();
      expect(screen.getByText('Log In')).toBeInTheDocument();
      
      // Verifica presenza input e labels
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Surname')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      
      // Verifica presenza placeholder
      expect(screen.getByPlaceholderText('Mario')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rossi')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('mario.rossi@esempio.com')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('********')).toHaveLength(2);
    });

    it('should have working navigation link to login', () => {
      render(Register);
      const loginLink = screen.getByText('Log In');
      expect(loginLink.getAttribute('href')).toBe('/login');
    });
  });

  describe('Form Validation - Empty Fields', () => {
    it('should show all validation errors when form is empty', async () => {
      render(Register);
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Surname is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show remaining validation errors when some fields are filled', async () => {
      render(Register);
      
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.getByText('Surname is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation - Email', () => {
    it.each([
      ['invalid-email', 'Email not valid'],
      ['invalid@', 'Email not valid'],
      ['@invalid.com', 'Email not valid'],
      ['invalid@invalid', 'Email not valid'],
      ['invalid.com', 'Email not valid'],
      [' ', 'Email is required'],
    ])('should show error for invalid email: %s', async (email, expectedError) => {
      render(Register);
      
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: email } });
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });

    it('should accept valid email formats', async () => {
      render(Register);
      
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'valid.email@domain.com' } });
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.queryByText('Email not valid')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation - Password', () => {
    it.each([
      ['123', 'Password has to be long at least 8 characters'],
      ['1234567', 'Password has to be long at least 8 characters'],
      [' '.repeat(7), 'Password has to be long at least 8 characters'],
    ])('should show error for short password: %s', async (password, expectedError) => {
      render(Register);
      
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: password } });
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
      render(Register);
      
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'different123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.getByText('The passwords inserted do not match')).toBeInTheDocument();
    });

    it('should not show password mismatch error when passwords match', async () => {
      render(Register);
      
      const password = 'password123';
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: password } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: password } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      expect(screen.queryByText('The passwords inserted do not match')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully with valid data', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'User created!' })
        })
      );

      render(Register);
      
      // Fill in all fields with valid data
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Surname'), { target: { value: 'Rossi' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sign up was successful!')).toBeInTheDocument();
      });

      // Verify fetch call
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Mario',
          last_name: 'Rossi',
          email: 'mario.rossi@example.com',
          password: 'password123'
        })
      });

      // Verify redirect
      await waitFor(() => {
        expect(goto).toHaveBeenCalledWith('/login');
      }, { timeout: 2500 }); // Consider the setTimeout in the component
    });

    it('should handle email already in use error', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Email already in use' })
        })
      );

      render(Register);
      
      // Fill in form with valid data
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Surname'), { target: { value: 'Rossi' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
      });
      expect(screen.queryByText('Sign up was successful!')).not.toBeInTheDocument();
      expect(goto).not.toHaveBeenCalled();
    });

    it('should handle generic server error', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Server error' })
        })
      );

      render(Register);
      
      // Fill in form with valid data
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Surname'), { target: { value: 'Rossi' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() => Promise.reject('Network error'));

      render(Register);
      
      // Fill in form with valid data
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Surname'), { target: { value: 'Rossi' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Errore di connessione al server')).toBeInTheDocument();
      });
    });

    it('should handle invalid JSON response', async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.reject('Invalid JSON')
        })
      );

      render(Register);
      
      // Fill in form with valid data
      await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Mario' } });
      await fireEvent.input(screen.getByLabelText('Surname'), { target: { value: 'Rossi' } });
      await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'mario.rossi@example.com' } });
      await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } });
      await fireEvent.input(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
      
      const submitButton = screen.getByText('Sign Up');
      await fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Something went wrong during Sign Up')).toBeInTheDocument();
      });
    });
  });
});