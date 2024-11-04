import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { setUser } from '$stores/userStore';

// Mock in-memory user session storage (replace with a real database lookup)
const sessionStore = new Map<string, User >();
sessionStore.set('secureRandomTokenForUser', { id: 1, email: 'User', isLoggedin: true });

export const load: LayoutServerLoad = async ({ cookies }) => {
    /*
    const sessionToken = cookies.get('session');
    if (!sessionToken) {
        throw redirect(302, '/login');
    }

    // fetch user data from the session
    const user = sessionStore.get(sessionToken);

    if (!user) {
        // If the token is invalid or user not found, redirect to login
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/login');
    }

    setUser(user)
    */
}