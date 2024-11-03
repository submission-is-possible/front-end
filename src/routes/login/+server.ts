// src/routes/login/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

async function authenticateUser(email: string, password: string): Promise<User | null> {
    const externalApiUrl = 'http://localhost:8000/users/login/';

    try {
        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        if(!response.ok){
            console.error('Error response from backend:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        let user: User = {email: email, id:data.user_id, isLoggedin:true};
        
        return user;
    }catch{
        console.error('Server Connection Error');
    }
    return null;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { email, password } = await request.json() as { email: string; password: string };

    const user = await authenticateUser(email, password);
    if (user) {

        // Generate a mock session token (use a secure method in production)
        const token = 'secureRandomTokenForUser'; // user.token(?)

        // Set a cookie with the session token
        cookies.set('session', token, {
            httpOnly: true,
            path: '/',
            secure: true,
            maxAge: 60 * 60 * 24 // 1 day in seconds
        });

        return json({ message: 'Login successful', user: user},{ status: 200});
    } else {
        return json({ message: 'Invalid credentials' }, { status: 401 });
    }
};