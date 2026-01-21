import {inject, Injectable, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {CurrencyStore} from '@core/currency/stores/currency.store';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Currency} from '@core/currency/models/currency';
import {formatNumber} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'userCurrencyPipe',
  pure: true,
  standalone: true,
})
export class UserCurrencyPipe implements PipeTransform {
  // TODO
  private readonly localeId = inject(LOCALE_ID);
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly planetStore = inject(PlanetStore);
  private readonly currencyStore = inject(CurrencyStore);

  transform(value: number, decimals = 2): string {
    const user = this.authenticationStore.user();
    const currencyRate = this.currencyStore.latestRate();
    if (!user || !currencyRate) {
      // TODO move the default currency to some global variable
      return this.formatToCurrencyString(value, Currency.USD, decimals);
    }

    const usersCurrency = this.planetStore.planets()?.find(planet => planet.id === user.planetId)?.currency;
    if (!usersCurrency) {
      // TODO move the default currency to some global variable
      return this.formatToCurrencyString(value, Currency.USD, decimals);
    }

    // TODO move the default currency to some global variable
    if (usersCurrency === Currency.USD) {
      return this.formatToCurrencyString(value, usersCurrency, decimals);
    }
    return this.formatToCurrencyString(value * currencyRate.rates[usersCurrency], usersCurrency, decimals);
  }

  private formatToCurrencyString(value: number, currency: Currency, decimals: number): string {
    return `${formatNumber(value, this.localeId, `1.${decimals}-${decimals}`)} ${currency}`;
  }
}
