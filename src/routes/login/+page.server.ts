import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const rememberMe = data.get('rememberMe') === 'on';

    // Basic validation
    if (!email || !password) {
      return fail(400, { 
        email, 
        error: 'Email and password are required' 
      });
    }

    try {
      // Replace with your actual authentication method
      

      if (true) {
        // Set a session cookie
        /*cookies.set('session', response.token, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          secure: import.meta.env.MODE === 'production', // Cambiato per usare import.meta.env.MODE
          maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 // 1 week or 1 hour
        });*/

        // Redirect to dashboard or home page
        throw redirect(302, '/dashboard');
      } else {
        return fail(400, { 
          email, 
          error: 'Invalid email or password' 
        });
      }
    } catch (error) {
      return fail(500, { 
        email, 
        error: 'An unexpected error occurred' 
      });
    }
  }
};

// Mock authentication function - replace with your actual auth logic
async function authenticateUser(email: string, password: string) {
  // Simulated authentication 
  if (email === 'test@example.com' && password === 'password123') {
    return { 
      success: true, 
      token: 'fake-jwt-token' 
    };
  }
  return { 
    success: false 
  };
}
