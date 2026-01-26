import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {TemperatureUnit} from '@core/planet/models/planet.model';

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'temperatureUnit',
  pure: true,
  standalone: true,
})
export class TemperatureUnitPipe implements PipeTransform {
  /**
   * Transforms a temperature value from Celsius (backend default) to the target unit.
   *
   * The transformation assumes all input values are in Celsius and converts them
   * to the specified target unit with appropriate formatting and unit symbol.
   *
   * @param celsiusValue - The temperature value in Celsius from the backend
   * @param targetUnit - The target temperature unit to convert to
   * @param decimals - Number of decimal places to display (default: 1)
   * @returns A formatted temperature string with unit symbol
   *
   * @example
   * // Convert 25°C to Fahrenheit
   * transform(25, TemperatureUnit.FAHRENHEIT) // Returns "77.0°F"
   *
   * @example
   * // Convert 0°C to Kelvin
   * transform(0, TemperatureUnit.KELVIN) // Returns "273.2°K"
   *
   * @example
   * // Keep in Celsius
   * transform(20, TemperatureUnit.CELSIUS) // Returns "20.0°C"
   */
  transform(celsiusValue: number, targetUnit: TemperatureUnit, decimals = 1): string {
    const convertedValue = this.convertFromCelsius(celsiusValue, targetUnit);
    const unitSymbol = this.getUnitSymbol(targetUnit);
    return `${convertedValue.toFixed(decimals)}${unitSymbol}`;
  }

  /**
   * Converts a temperature value from Celsius to the target unit.
   *
   * Conversion formulas:
   * - Celsius to Fahrenheit: (C × 9/5) + 32
   * - Celsius to Kelvin: C + 273.15
   * - Celsius to Celsius: C (no conversion)
   *
   * @param celsius - The temperature value in Celsius
   * @param targetUnit - The target unit to convert to
   * @returns The converted temperature value
   * @private
   */
  private convertFromCelsius(celsius: number, targetUnit: TemperatureUnit): number {
    switch (targetUnit) {
      case TemperatureUnit.FAHRENHEIT:
        return (celsius * 9 / 5) + 32;
      case TemperatureUnit.KELVIN:
        return celsius + 273.15;
      case TemperatureUnit.CELSIUS:
      default:
        return celsius;
    }
  }

  /**
   * Gets the unit symbol for the specified temperature unit.
   *
   * @param unit - The temperature unit
   * @returns The corresponding unit symbol (°C, °F, or K)
   * @private
   */
  private getUnitSymbol(unit: TemperatureUnit): string {
    switch (unit) {
      case TemperatureUnit.CELSIUS:
        return '°C';
      case TemperatureUnit.FAHRENHEIT:
        return '°F';
      case TemperatureUnit.KELVIN:
        return 'K';
      default:
        return '°C';
    }
  }
}
