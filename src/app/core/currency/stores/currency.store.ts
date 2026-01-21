import {CurrencyRateModel} from '@core/currency/models/currency-rate.model';
import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {inject} from '@angular/core';
import {CurrencyRateService} from '@core/currency/services/currency-rate.service';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';

interface CurrencyState {
  latestRate: CurrencyRateModel | null;
}

const initialState: CurrencyState = {
  latestRate: null,
};

export const CurrencyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const currencyRateService = inject(CurrencyRateService);

    return {
      startPolling: rxMethod<void>(
        pipe(
          switchMap(() =>
            currencyRateService.startCurrencyRateUpdate().pipe(
              tap({
                next: (newRates) => {
                  patchState(store, {latestRate: newRates});
                },
              }),
              catchError(() => EMPTY),
            ),
          ),
        )
      ),
      stopPolling: () => {
        currencyRateService.stopUpdatingCurrencyRates();
      },
    };
  }),
);
