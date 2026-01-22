import {inject, Injectable, Pipe, PipeTransform} from '@angular/core';
import {CurrencyStore} from '@core/currency/stores/currency.store';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Currency} from '@core/currency/models/currency';
import {formatNumber} from '@angular/common';
import {DEFAULT_CURRENCY} from '@core/config/config.token';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'userCurrencyPipe',
  pure: true,
  standalone: true,
})
export class UserCurrencyPipe implements PipeTransform {
  private readonly defaultCurrency = inject(DEFAULT_CURRENCY);
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly planetStore = inject(PlanetStore);
  private readonly currencyStore = inject(CurrencyStore);

  /**
   * Transforms a numeric value into a formatted currency string based on the user's planet currency.
   *
   * The transformation follows this priority:
   * 1. If user or currency rates are unavailable, formats using the default currency
   * 2. If the user's planet currency matches the default currency, formats directly
   * 3. Otherwise, converts the value using the latest exchange rate and formats
   *
   * @param value - The numeric value to transform into a currency string
   * @param decimals - Number of decimal places to display (default: 2)
   * @returns A formatted currency string in the user's planet currency
   *
   * @example
   * // User's planet uses EUR, value is in USD (default currency)
   * transform(100, 2) // Returns "€85.50" (if exchange rate is 0.855)
   *
   * @example
   * // User's planet uses the default currency
   * transform(100, 2) // Returns "$100.00" (no conversion needed)
   */
  transform(value: number, decimals = 2): string {
    const user = this.authenticationStore.user();
    const currencyRate = this.currencyStore.latestRate();
    if (!user || !currencyRate) {
      return this.formatToCurrencyString(value, this.defaultCurrency, decimals);
    }

    const usersCurrency = this.planetStore.planets()?.find(planet => planet.id === user.planetId)?.currency;
    if (!usersCurrency) {
      return this.formatToCurrencyString(value, this.defaultCurrency, decimals);
    }

    if (usersCurrency === this.defaultCurrency) {
      return this.formatToCurrencyString(value, usersCurrency, decimals);
    }
    return this.formatToCurrencyString(value * currencyRate.rates[usersCurrency], usersCurrency, decimals);
  }

  /**
   * Formats a numeric value as a localized currency string with the specified decimal precision.
   *
   * The format follows the pattern: "123.45 USD" where the number is localized according
   * to the user's locale preferences and the currency code is appended.
   *
   * @param value - The numeric value to format
   * @param currency - The currency code to append (e.g., "USD", "EUR", "GBP")
   * @param decimals - Number of decimal places to display (both minimum and maximum)
   * @returns A formatted string combining the localized number and currency code
   *
   * @example
   * // User locale is "en-US"
   * formatToCurrencyString(1234.5, "USD", 2) // Returns "1,234.50 USD"
   *
   * @example
   * // User locale is "es-ES"
   * formatToCurrencyString(1234.5, "EUR", 2) // Returns "1.234,50 EUR"
   *
   * @private
   */
  private formatToCurrencyString(value: number, currency: Currency, decimals: number): string {
    return `${formatNumber(value, this.authenticationStore.userLocale(), `1.${decimals}-${decimals}`)} ${currency}`;
  }
}
