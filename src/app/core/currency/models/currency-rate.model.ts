import {Currency} from '@core/currency/models/currency';

export interface CurrencyRateModel {
  base: Currency,
  timeStamp: string;
  rates: Record<Currency, number>;
}
