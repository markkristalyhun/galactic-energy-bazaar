import {TestBed} from '@angular/core/testing';
import {TemperatureUnitPipe} from './temperature-unit.pipe';
import {TemperatureUnit} from '@core/planet/models/planet.model';

describe('TemperatureUnitPipe', () => {
  let pipe: TemperatureUnitPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemperatureUnitPipe]
    });
    pipe = TestBed.inject(TemperatureUnitPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Celsius conversion', () => {
    it('should return the same value in Celsius', () => {
      expect(pipe.transform(25, TemperatureUnit.CELSIUS)).toBe('25.0°C');
    });

    it('should handle negative Celsius values', () => {
      expect(pipe.transform(-10, TemperatureUnit.CELSIUS)).toBe('-10.0°C');
    });

    it('should handle zero Celsius', () => {
      expect(pipe.transform(0, TemperatureUnit.CELSIUS)).toBe('0.0°C');
    });
  });

  describe('Fahrenheit conversion', () => {
    it('should convert 0°C to 32°F', () => {
      expect(pipe.transform(0, TemperatureUnit.FAHRENHEIT)).toBe('32.0°F');
    });

    it('should convert 25°C to 77°F', () => {
      expect(pipe.transform(25, TemperatureUnit.FAHRENHEIT)).toBe('77.0°F');
    });

    it('should convert -10°C to 14°F', () => {
      expect(pipe.transform(-10, TemperatureUnit.FAHRENHEIT)).toBe('14.0°F');
    });

    it('should convert 100°C to 212°F (boiling point)', () => {
      expect(pipe.transform(100, TemperatureUnit.FAHRENHEIT)).toBe('212.0°F');
    });
  });

  describe('Kelvin conversion', () => {
    it('should convert 0°C to 273.15K', () => {
      expect(pipe.transform(0, TemperatureUnit.KELVIN)).toBe('273.1K');
    });

    it('should convert 25°C to 298.15K', () => {
      expect(pipe.transform(25, TemperatureUnit.KELVIN)).toBe('298.1K');
    });

    it('should convert -273.15°C to 0K (absolute zero)', () => {
      expect(pipe.transform(-273.15, TemperatureUnit.KELVIN)).toBe('0.0K');
    });
  });

  describe('Decimal precision', () => {
    it('should use 1 decimal place by default', () => {
      expect(pipe.transform(25.555, TemperatureUnit.CELSIUS)).toBe('25.6°C');
    });

    it('should support custom decimal places', () => {
      expect(pipe.transform(25.555, TemperatureUnit.CELSIUS, 2)).toBe('25.55°C');
    });

    it('should support 0 decimal places', () => {
      expect(pipe.transform(25.555, TemperatureUnit.CELSIUS, 0)).toBe('26°C');
    });
  });
});
