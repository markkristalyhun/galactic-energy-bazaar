import {InjectionToken} from '@angular/core';
import {Currency} from '@core/currency/models/currency';
import {environment} from '@env/environment';

export const DEFAULT_CURRENCY = new InjectionToken<Currency>('Default currency', {
  providedIn: 'root',
  factory: () => environment.defaultCurrency as Currency,
});
