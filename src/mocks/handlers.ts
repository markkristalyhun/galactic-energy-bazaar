import { http, HttpResponse } from 'msw';
import {users} from './user.mock';
import {sessionStore} from './session-store';

export const handlers = [
  http.post<any, {email: string, password: string}>('/api/login', async ({ request }) => {
    const { email, password } = await request.json();

    const user = users.find(
      userElement => userElement.email === email && userElement.password === password
    );

    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const session = sessionStore.createSession(user.id, user.email);

    // Manually set cookies in browser
    document.cookie = `XSRF-TOKEN=${session.csrfToken}; Secure; SameSite=Strict; Path=/`;
    document.cookie = `auth_token=${session.authToken}; Secure; SameSite=Strict; Path=/`;

    return HttpResponse.json(
      {
        success: true,
        user: { id: user.id, username: user.email, planetId: user.planetId }
      },
      {
        status: 200,
        headers: {
          // Set auth token as HttpOnly cookie (XSS protection)
          'Set-Cookie': `auth_token=${session.authToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
          // Set CSRF token as readable cookie (CSRF protection)
          'X-Set-CSRF-Token': `XSRF-TOKEN=${session.csrfToken}; Secure; SameSite=Strict; Path=/`
        }
      }
    );
  }),

  http.post('/api/logout', ({ cookies }) => {
    const authToken = cookies['auth_token'];

    if (authToken) {
      sessionStore.deleteSession(authToken);
    }

    return HttpResponse.json(
      { success: true },
      {
        headers: {
          // Clear cookies
          'Set-Cookie': 'auth_token=; Max-Age=0; Path=/',
          'X-Set-CSRF-Token': 'XSRF-TOKEN=; Max-Age=0; Path=/'
        }
      }
    );
  }),

  http.get('/api/planets', () => HttpResponse.json([
    {id: '1', name: 'Earth'},
    {id: '2', name: 'Ulthar'},
  ]))
];
