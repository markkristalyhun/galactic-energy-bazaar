import {http, HttpResponse, ws} from 'msw';
import {users} from './user.mock';
import {sessionStore} from './session-store';

const getRandomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const randomNumber = (min: number, max: number, decimalPlaces: number): number => {
  const rand = Math.random() * (max - min) + min;
  const power = Math.pow(10, decimalPlaces);
  return Math.floor(rand * power) / power;
}

const unauthorizedError = () => HttpResponse.json(
  { message: 'error.unauthorized' },
  { status: 401 }
);

const invalidSessionError = () => HttpResponse.json(
  { message: 'error.invalidSession' },
  { status: 401 }
);

const transactionSocket = ws.link('ws://localhost:4200/api/transactions');

export const handlers = [
  http.post<any, {email: string, password: string}>('/api/login', async ({ request }) => {
    const { email, password } = await request.json();

    const user = users.find(
      userElement => userElement.email === email && userElement.password === password
    );

    if (!user) {
      return HttpResponse.json(
        { message: 'error.invalidCredentials' },
        { status: 401 }
      );
    }

    const session = sessionStore.createSession(user.id, user.email);

    // Manually set cookies in browser
    document.cookie = `XSRF-TOKEN=${session.csrfToken}; Secure; SameSite=Strict; Path=/`;
    document.cookie = `auth_token=${session.authToken}; Secure; SameSite=Strict; Path=/`;

    return HttpResponse.json(
      { id: user.id, username: user.email, planetId: user.planetId, role: user.role },
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

  http.get('/api/planets', ({ cookies }) => {
    const authToken = cookies['auth_token'];
    if (!authToken) {
      return unauthorizedError();
    }

    const session = sessionStore.getSessionByAuthToken(authToken);
    if (!session) {
      return invalidSessionError();
    }

    return HttpResponse.json([
      {id: '1', name: 'Earth', currency: 'USD', locale: 'en-US'},
      {id: '2', name: 'Ulthar', currency: 'UTH', locale: 'es-ES'},
      {id: '3', name: 'Javia', currency: 'JAV', locale: 'en-US'},
    ])
  }),

  http.get('/api/rates', ({request}) => {
    const existingCurrencies = ['USD', 'UTH', 'JAV'];

    const url = new URL(request.url);
    const baseCurrency = url.searchParams.get('base');

    if (!baseCurrency) {
      return new HttpResponse(null, {status: 404});
    }

    const currencyRates = existingCurrencies
      .filter(currency => currency !== baseCurrency)
      .map(currency => ({
        currency,
        rate: randomNumber(0.5, 1.8, 4),
      }))
      .reduce((accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.currency]: currentValue.rate,
        };
      }, {});

    return HttpResponse.json({
      base: baseCurrency,
      timeStamp: (new Date()).toISOString(),
      rates: currencyRates,
    });
  }),

  transactionSocket.addEventListener('connection', ({client}) => {
    // Simulate incoming messages
    const interval = setInterval(() => {
      client.send(JSON.stringify({
        id: Math.random().toString(),
        product: 'ENERGY',
        transactionType: getRandomElement(['BUY', 'SELL']),
        timeStamp: (new Date()).toISOString(),
        volume: randomNumber(5, 5000, 0),
        pricePerUnit: randomNumber(1, 10000, 2),
        planetId: getRandomElement(['1', '2', '3']),
      }));
    }, 1); // 1000 messages/second for testing

    // Clean up on disconnect
    client.addEventListener('close', () => {
      clearInterval(interval);
    });
  })
];
