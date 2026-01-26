# Galactic Energy Bazaar

## Design notes

### Real-Time Transaction Data 📈

#### WebSocket Data Stream
Transaction data is received in real-time through a **WebSocket connection**, enabling live updates as transactions occur.

#### Data Buffering
Incoming transaction messages are **buffered for 500ms** before processing. This batching mechanism prevents UI thrashing during high-frequency data streams and improves rendering performance.

#### Error Handling and Reliability
The WebSocket implementation includes:
- **Retry logic** to automatically reconnect on connection failures
- **Error handling** to gracefully manage malformed messages or connection issues

#### State Management

Transaction data is stored in a **single mutable array** within the transaction service. New transactions are added using array mutation methods rather than creating new array instances. This approach:
- **Avoids expensive object recreations**
- **Optimizes CDK table rendering** by maintaining stable object references for change tracking
- **Improves performance** during high-frequency data streams by minimizing memory allocations

The CDK table's `trackBy` function uses transaction IDs to efficiently identify which rows need updates, ensuring smooth rendering even with frequent data updates.


#### Localization
Transaction data is **localized within the dashboard component**, where currency conversion and formatting are applied based on the user's planet-specific settings

#### Performance
The current implementation provides **good UI performance**. However, if data volumes increase significantly, the buffering and processing logic can be **moved to a separate Web Worker** to further isolate heavy processing from the main UI thread.

### Currency Handling 💶

#### Currency Rate Polling
The application polls currency exchange rates from the mock server **every 60 seconds** to ensure up-to-date conversion data. The currency type used for each user is determined by their **planet configuration**.

#### Currency Conversion and Localization
The `userCurrencyPipe` handles both currency conversion and localization. This pipe:
- Converts amounts from the base currency to the user's planet-specific currency
- Formats the output according to the user's locale (decimal separators, digit grouping)

#### Default Configuration
The default currency is defined in the **environment configuration** file and is used when no user-specific currency is available.

### API and WebSocket Mocking with MSW 🔌

The application uses **Mock Service Worker (MSW)** to intercept and mock both HTTP requests and WebSocket connections.

#### Why MSW?

MSW was chosen to handle **high-volume WebSocket data streams** without impacting the UI thread. By intercepting requests at the network level:
- Heavy data generation runs outside the main UI thread
- Browser rendering performance remains smooth during high-frequency WebSocket messages

### Authentication, security 🔐

This project uses cookie-based authentication for session management. This approach was chosen for:

**Security** - Cookies with `httpOnly` and `secure` flags provide built-in XSS protection, as tokens cannot be accessed by client-side JavaScript. CSRF tokens are implemented to prevent cross-site request forgery attacks

**Simplicity** - Browsers automatically attach cookies to requests, eliminating the need for manual token management or custom authorization headers in the frontend.

**Session control** - Server-side session management enables straightforward logout and access revocation when needed.

#### HTTP Status Code Authorization
The application handles authorization through **HTTP interceptors** that monitor response status codes:
- **401 Unauthorized** - Indicates the user's session has expired or is invalid. The application automatically redirects to the login page.
- **403 Forbidden** - The user is authenticated but lacks permission for the requested resource. The application redirects to the `/unauthorized` page.

This centralized error handling ensures consistent authorization enforcement across all HTTP requests.

#### Session Restoration
When the application loads, it **automatically attempts to restore the user's session** by checking for valid authentication cookies. If a valid session exists:
- The user is automatically logged in without requiring credentials
- User profile data (including locale and planet settings) is fetched and applied
- The user is redirected to their intended destination or the default dashboard

If no valid session is found, the user is presented with the login page. This seamless restoration improves user experience by maintaining sessions across browser refreshes and tab closures.

### Role-Based Access Control 🪪

The application enforces role-based authorization using two complementary mechanisms.

#### Route Guards
- Protected routes use `canActivate` guards to verify user roles before navigation
- Unauthorized users are blocked from accessing restricted routes and redirected to `/unauthorized` page

#### Template Directive
The application includes custom structural directives for enhanced UI control:

- **`appHasPlanet`** - Controls element visibility based on the user's planet affiliation. Elements are only rendered when the user belongs to the specified planet(s), enabling planet-specific features and content.

- **`appHasRole`** - Manages element visibility based on authentication status. Elements are conditionally rendered depending on whether the user is logged in or logged out, simplifying the creation of authentication-dependent UI sections.

This dual approach ensures authorization is enforced at both the routing and presentation layers.

### State Management with SignalStore 📊

The application uses **NgRx SignalStore** for state management, a modern approach that leverages Angular's signal-based reactivity.

#### Why SignalStore?

**Minimal Boilerplate** - Reduces code compared to traditional Redux patterns by defining state, actions, and selectors in a single store definition.

**Signal-Based Reactivity** - Built on Angular's native signals for fine-grained reactivity and automatic component updates.

**Modern Angular** - Aligns with Angular's latest architecture, including standalone components and signal-based APIs.

Stores are organized by feature domain.

#### Implementation
Stores are organized by feature domain (e.g., `authStore`, `currencyStore`, `transactionStore`), keeping state management modular and maintainable. Each store encapsulates its own state, computed values, and methods for state updates.

### Progressive Data Loading 🔄

The application loads page data (dashboard transactions and planet information) **directly from components** rather than using Angular routing resolvers.

#### Why Component-Based Loading?

**Skeleton Loaders** - This approach enables displaying **skeleton loaders** (currently implemented for the dashboard) while data is being fetched. Users see an immediate visual response instead of staring at a blank screen.

**Modern UX** - Progressive content loading is a **user-friendly pattern** that provides faster perceived performance and reduces the feeling of waiting.

### Translations, localizations 🌍

#### Login Page
The application uses the **default language and locale** on the login page before authentication. This ensures a consistent initial experience for all users regardless of their account settings.

#### Post-Authentication
After successful login, the application automatically switches to use the **user's planet-specific locale**. This locale configuration is retrieved from the user's profile settings and applied throughout the authenticated session, ensuring that:
- Date and time formats match the user's planetary standards
- Number formatting follows local conventions
- Currency displays use appropriate formats

#### Logout
When the user logs out, the application **reverts to the default language and locale**. This returns the login page to its initial state, ready for the next user session with neutral localization settings.

#### Transloco

Modular translation files - Transloco supports splitting translations into multiple scoped files, allowing each feature module to maintain its own translation dictionary. This improves maintainability and reduces bundle size by enabling lazy-loading of translations.

Angular-native solution - Built specifically for Angular, Transloco integrates seamlessly with the framework's dependency injection and change detection systems, providing better performance than generic i18n libraries.

#### Scope Limitations
**Image-based translations** are **out of MVP scope** and are not part of this demo application. Only text-based localization is implemented.

### UI Design 🎨

#### Angular Material
The application design is built using the **Angular Material** library, providing a consistent and accessible component framework.

#### Theme Support
As this is an **MVP (Minimum Viable Product)**, the application currently **only supports dark mode**.

### Mock Users 👥

The application includes **three mock users** for testing different roles and planet configurations:

| Email | Password | Planet     | Language   | Role | Description |
|-------|----------|------------|------------|------|-------------|
| `human@earth.com` | `123456` | Earth      | English    | `TRADER` | Standard trader with Earth-specific locale and currency |
| `ultharian@ulthar.uth` | `Mypass123` | Ulthar | Ultharian (ES) | `TRADER` | Standard trader with Ulthar-specific settings |
| `admin@earth.com` | `654321` | Earth      | English    | `ADMIN` | Full administrative access to all features |

## Application

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
