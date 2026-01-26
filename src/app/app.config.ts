import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import {errorHandlerInterceptor} from '@core/interceptors/error-handler.interceptor';
import {retryHttpInterceptor} from '@core/interceptors/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        retryHttpInterceptor,
        errorHandlerInterceptor,
      ]),
    ),
    provideTransloco({
        config: {
          availableLangs: ['en', 'es'],
          defaultLang: 'en',
          // Remove this option if your application doesn't support changing language in runtime.
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      })
  ]
};
