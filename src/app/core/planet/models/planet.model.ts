import {Currency} from '@core/currency/models/currency';

export interface PlanetModel {
  id: string;
  name: string;
  currency: Currency;
  locale: string;
}
