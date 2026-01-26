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

// Mock planet data with translation keys
const mockPlanets = [
  {
    id: '1',
    name: 'Earth',
    currency: 'USD',
    locale: 'en-US',
    temperatureUnit: 'FAHRENHEIT',
    weather: 'planet.weatherConditions.temperate',
    population: 7900000000,
    sector: 'planet.sectors.alpha',
    climateZones: [
      {
        zone: 'planet.zones.equatorial',
        temperature: 28,
        humidity: 75,
        condition: 'planet.climateConditions.humid'
      },
      {
        zone: 'planet.zones.temperate',
        temperature: 15,
        humidity: 60,
        condition: 'planet.climateConditions.mild'
      },
      {
        zone: 'planet.zones.polar',
        temperature: -10,
        humidity: 40,
        condition: 'planet.climateConditions.harsh'
      }
    ],
    energySources: [
      {
        source: 'planet.energySources.solar',
        output: '450 Zeta Joules',
        percentage: 35
      },
      {
        source: 'planet.energySources.nuclear',
        output: '380 Zeta Joules',
        percentage: 30
      },
      {
        source: 'planet.energySources.wind',
        output: '280 Zeta Joules',
        percentage: 22
      },
      {
        source: 'planet.energySources.hydroelectric',
        output: '165 Zeta Joules',
        percentage: 13
      }
    ]
  },
  {
    id: '2',
    name: 'Ulthar',
    currency: 'UTH',
    locale: 'es-ES',
    temperatureUnit: 'CELSIUS',
    weather: 'planet.weatherConditions.arid',
    population: 4200000000,
    sector: 'planet.sectors.gamma',
    climateZones: [
      {
        zone: 'planet.zones.north',
        temperature: 35,
        humidity: 20,
        condition: 'planet.climateConditions.dry'
      },
      {
        zone: 'planet.zones.south',
        temperature: 42,
        humidity: 15,
        condition: 'planet.climateConditions.extreme'
      },
      {
        zone: 'planet.zones.central',
        temperature: 38,
        humidity: 18,
        condition: 'planet.climateConditions.harsh'
      }
    ],
    energySources: [
      {
        source: 'planet.energySources.solar',
        output: '850 Zeta Joules',
        percentage: 60
      },
      {
        source: 'planet.energySources.fusion',
        output: '425 Zeta Joules',
        percentage: 30
      },
      {
        source: 'planet.energySources.geothermal',
        output: '142 Zeta Joules',
        percentage: 10
      }
    ]
  },
  {
    id: '3',
    name: 'Javia',
    currency: 'JAV',
    locale: 'en-US',
    temperatureUnit: 'KELVIN',
    weather: 'planet.weatherConditions.variable',
    population: 6500000000,
    sector: 'planet.sectors.beta',
    climateZones: [
      {
        zone: 'planet.zones.east',
        temperature: 22,
        humidity: 65,
        condition: 'planet.climateConditions.pleasant'
      },
      {
        zone: 'planet.zones.west',
        temperature: 18,
        humidity: 70,
        condition: 'planet.climateConditions.mild'
      },
      {
        zone: 'planet.zones.central',
        temperature: 20,
        humidity: 68,
        condition: 'planet.climateConditions.stable'
      }
    ],
    energySources: [
      {
        source: 'planet.energySources.antimatter',
        output: '720 Zeta Joules',
        percentage: 45
      },
      {
        source: 'planet.energySources.fusion',
        output: '560 Zeta Joules',
        percentage: 35
      },
      {
        source: 'planet.energySources.plasma',
        output: '240 Zeta Joules',
        percentage: 15
      },
      {
        source: 'planet.energySources.solar',
        output: '80 Zeta Joules',
        percentage: 5
      }
    ]
  }
];

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

  http.get('/api/session', ({ cookies }) => {
    const authToken = cookies['auth_token'];

    if (!authToken) {
      return unauthorizedError();
    }

    const session = sessionStore.getSessionByAuthToken(authToken);
    if (!session) {
      return invalidSessionError();
    }

    const user = users.find(u => u.id === session.userId);
    if (!user) {
      return invalidSessionError();
    }

    return HttpResponse.json({
      id: user.id,
      username: user.email,
      planetId: user.planetId,
      role: user.role
    });
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

  http.get('/api/planets/:planetId', ({ cookies, params }) => {
    const authToken = cookies['auth_token'];
    if (!authToken) {
      return unauthorizedError();
    }

    const session = sessionStore.getSessionByAuthToken(authToken);
    if (!session) {
      return invalidSessionError();
    }

    const { planetId } = params;
    const planet = mockPlanets.find(p => p.id === planetId);

    if (!planet) {
      return HttpResponse.json(
        { message: 'error.planetNotFound' },
        { status: 404 }
      );
    }

    return HttpResponse.json(planet);
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
