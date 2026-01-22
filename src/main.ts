import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {isDevMode} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es-ES');

// Only enable MSW in development
async function enableMocking() {
  if (!isDevMode()) {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // Wait for the worker to be ready to avoid race conditions
  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    quiet: true,
  });
}

enableMocking().then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
