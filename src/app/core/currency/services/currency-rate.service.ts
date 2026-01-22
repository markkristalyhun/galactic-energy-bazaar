import {inject, Injectable} from '@angular/core';
import {Observable, retry, share, Subject, switchMap, takeUntil, tap, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CurrencyRateModel} from '@core/currency/models/currency-rate.model';
import {environment} from '@env/environment';
import {DEFAULT_CURRENCY} from '@core/config/config.token';

const CURRENCY_RATE_UPDATE_MS = 60000;

@Injectable({
  providedIn: 'root',
})
export class CurrencyRateService {
  private readonly http = inject(HttpClient);
  private readonly defaultCurrency = inject(DEFAULT_CURRENCY);

  private hasStreamCompleted = false;
  private pollingStream$: Observable<CurrencyRateModel> | null = null;

  private readonly stopCurrencyRatePolling$ = new Subject<void>();

  public startCurrencyRateUpdate(): Observable<CurrencyRateModel> {
    if (this.pollingStream$ && !this.hasStreamCompleted) {
      return this.pollingStream$;
    }

    const url = new URL('api/rates', environment.forexApiUrl);
    url.searchParams.set('base', this.defaultCurrency);

    this.hasStreamCompleted = false;
    this.pollingStream$ = timer(0, CURRENCY_RATE_UPDATE_MS).pipe(
      switchMap(() => this.http.get<CurrencyRateModel>(url.href)),
      retry(),
      share(),
      takeUntil(this.stopCurrencyRatePolling$),
      tap({
        complete: () => this.hasStreamCompleted = true,
      })
    );

    return this.pollingStream$;
  }

  public stopUpdatingCurrencyRates() {
    this.stopCurrencyRatePolling$.next();
  }
}
