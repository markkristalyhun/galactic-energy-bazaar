# Galactic Energy Bazaar

## Design notes

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

### Role-Based Access Control 🪪

The application enforces role-based authorization using two complementary mechanisms.

#### Route Guards
- Protected routes use `canActivate` guards to verify user roles before navigation
- Unauthorized users are blocked from accessing restricted routes and redirected to `/unauthorized` page

#### Template Directive
- The `appHasRole` structural directive controls UI element visibility based on user roles
- Elements are only rendered in the DOM when the user has the required role

This dual approach ensures authorization is enforced at both the routing and presentation layers.

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

### UI Design 🎨

#### Angular Material
The application design is built using the **Angular Material** library, providing a consistent and accessible component framework.

#### Theme Support
As this is an **MVP (Minimum Viable Product)**, the application currently **only supports dark mode**.

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
