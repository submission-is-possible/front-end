import { render, fireEvent, waitFor, screen } from '@testing-library/svelte';
import Login from '../src/routes/login/+page.svelte';
import { setUser, user } from '$stores/userStore';
import { goto } from '$app/navigation';


describe('Login component', () => {
  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render the login form', () => {
    render(Login);

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should display an error message if login fails', async () => {
    render(Login);

    await fireEvent.submit(screen.getByTestId('login-form'));
    await waitFor(() => expect(screen.getByTestId('error-message')).toBeInTheDocument());
  });

  it('should redirect to the home page on successful login', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user_id:1 })
    });
    vi.mock('$stores/userStore', () => ({
      setUser: vi.fn()
    }));

    render(Login);

    await fireEvent.submit(screen.getByTestId('login-form'));
    await waitFor(() => expect(goto).toHaveBeenCalledWith('/'));
    expect(setUser).toHaveBeenCalledWith({ email: '', id: 1, isLoggedin : true });
  });


  it('should display a loading spinner while fetching', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => new Promise(() => {})
    });
    render(Login);

    await fireEvent.submit(screen.getByTestId('login-form'));
    expect(screen.getByTestId('loading-mark')).toBeInTheDocument();
  });

});