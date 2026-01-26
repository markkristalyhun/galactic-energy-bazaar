import {Currency} from '@core/currency/models/currency';

export interface PlanetClimateModel {
  zone: string;
  temperature: number;
  humidity: number;
  condition: string;
}

export interface PlanetEnergyModel {
  source: string;
  output: string;
  percentage: number;
}

export interface PlanetSimpleModel {
  id: string;
  name: string;
  currency: Currency;
  locale: string;
}

export interface PlanetModel extends PlanetSimpleModel {
  weather: string;
  climateZones: PlanetClimateModel[];
  population: number;
  sector: string;
  energySources: PlanetEnergyModel[];
}
