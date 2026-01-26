import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Dashboard} from './dashboard';
import {LOCALE_ID, signal} from '@angular/core';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {PlanetModel, TemperatureUnit} from '@core/planet/models/planet.model';
import {TransactionModel, TransactionType} from '@core/transaction/models/transaction.model';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';
import {ProductType} from '@core/transaction/models/product.model';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {UserCurrencyPipe} from '@core/currency/pipes/user-currency.pipe';
import {Currency} from '@core/currency/models/currency';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let compiled: HTMLElement;
  let mockAuthStore: any;
  let mockCurrencyPipe: any;

  beforeEach(async () => {
    mockAuthStore = {
      userLocale: signal('en-US')
    };

    mockCurrencyPipe = {
      transform: (value: number) => `$${value.toFixed(2)}`
    };

    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'product.ENERGY': 'Energy',
              'product.FOOD': 'Food',
              'transaction.BUY': 'Buy',
              'transaction.SELL': 'Sell'
            }
          },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en',
          }
        })
      ],
      providers: [
        { provide: LOCALE_ID, useValue: 'en-US' },
        { provide: AuthenticationStore, useValue: mockAuthStore },
        { provide: UserCurrencyPipe, useValue: mockCurrencyPipe }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should have transactions input with empty array default', () => {
      expect(component.transactions()).toEqual([]);
    });

    it('should have leaderboardValues input with empty array default', () => {
      expect(component.leaderboardValues()).toEqual([]);
    });

    it('should have planets input with empty array default', () => {
      expect(component.planets()).toEqual([]);
    });

    it('should accept transactions input', () => {
      const mockTransactions: TransactionModel[] = [{
        id: 'tx1',
        timeStamp: new Date('2026-01-18').toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet1',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5
      }];

      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      expect(component.transactions()).toEqual(mockTransactions);
    });
  });

  describe('planetMap computed signal', () => {
    it('should create a map of planets by id', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet2', name: 'Mars', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.detectChanges();

      const planetMap = component['planetMap']();
      expect(planetMap.get('planet1')?.name).toBe('Earth');
      expect(planetMap.get('planet2')?.name).toBe('Mars');
      expect(planetMap.size).toBe(2);
    });

    it('should return empty map when no planets provided', () => {
      const planetMap = component['planetMap']();
      expect(planetMap.size).toBe(0);
    });

    it('should update when planets input changes', () => {
      const mockPlanets1: PlanetModel[] = [{ id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }];
      fixture.componentRef.setInput('planets', mockPlanets1);
      fixture.detectChanges();

      let planetMap = component['planetMap']();
      expect(planetMap.size).toBe(1);

      const mockPlanets2: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet2', name: 'Mars', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet3', name: 'Venus', currency: Currency.USD, locale: 'es-ES', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];
      fixture.componentRef.setInput('planets', mockPlanets2);
      fixture.detectChanges();

      planetMap = component['planetMap']();
      expect(planetMap.size).toBe(3);
    });
  });

  describe('updateCalculatedTableData', () => {
    it('should format transactions with planet names and calculated sum', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];

      const mockTransactions: TransactionModel[] = [{
        id: 'tx1',
        timeStamp: new Date('2026-01-18T10:30:00').toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet1',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5
      }];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      component.updateCalculatedTableData();

      const formatted = component.transactions();
      expect((formatted[0] as any).planet).toBe('Earth');
      expect((formatted[0] as any).sum).toBe('$50.00');
      expect((formatted[0] as any).time).toBeDefined();
      expect((formatted[0] as any).formattedProduct).toBe('Energy');
      expect((formatted[0] as any).formattedTransactionType).toBe('Buy');
      expect((formatted[0] as any).formattedPricePerUnit).toBe('$10.00');
      expect((formatted[0] as any).formattedVolume).toBe('5');
    });

    it('should fallback to planetId when planet not found', () => {
      const mockTransactions: TransactionModel[] = [{
        id: 'tx1',
        timeStamp: new Date().toISOString(),
        product: ProductType.ENERGY,
        planetId: 'unknown',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5
      }];

      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      component.updateCalculatedTableData();

      const formatted = component.transactions();
      expect((formatted[0] as any).planet).toBe('unknown');
    });

    it('should format multiple transactions correctly', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet2', name: 'Mars', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];

      const mockTransactions: TransactionModel[] = [
        {
          id: 'tx1',
          timeStamp: new Date('2026-01-18').toISOString(),
          product: ProductType.ENERGY,
          planetId: 'planet1',
          transactionType: TransactionType.BUY,
          pricePerUnit: 10,
          volume: 5
        },
        {
          id: 'tx2',
          timeStamp: new Date('2026-01-19').toISOString(),
          product: ProductType.ENERGY,
          planetId: 'planet2',
          transactionType: TransactionType.SELL,
          pricePerUnit: 20,
          volume: 3
        }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      component.updateCalculatedTableData();

      const formatted = component.transactions();
      expect(formatted).toHaveLength(2);
      expect((formatted[0] as any).planet).toBe('Earth');
      expect((formatted[1] as any).planet).toBe('Mars');
      expect((formatted[0] as any).sum).toBe('$50.00');
      expect((formatted[1] as any).sum).toBe('$60.00');
    });

    it('should format volume with correct decimal places', () => {
      const mockTransactions: TransactionModel[] = [{
        id: 'tx1',
        timeStamp: new Date().toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet1',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5.456
      }];

      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      component.updateCalculatedTableData();

      const formatted = component.transactions();
      expect((formatted[0] as any).formattedVolume).toBe('5.46');
    });

    it('should return empty array when no transactions', () => {
      const formatted = component.transactions();
      expect(formatted).toEqual([]);
    });
  });

  describe('formattedLeaderboardValues computed signal', () => {
    it('should format leaderboard with planet names', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];

      const mockLeaderboard: LeaderboardModel[] = [{
        planetId: 'planet1',
        sumTransactionValue: 1000,
        numberOfTransactions: 10
      }];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);
      fixture.detectChanges();

      const formatted = component.formattedLeaderboardValues();
      expect(formatted[0].planet).toBe('Earth');
      expect(formatted[0].sumTransactionValue).toBe(1000);
      expect(formatted[0].sum).toBe('$1000.00');
      expect(formatted[0].formattedNumberOfTransactions).toBe('10');
    });

    it('should fallback to planetId when planet not found', () => {
      const mockLeaderboard: LeaderboardModel[] = [{
        planetId: 'unknown',
        sumTransactionValue: 500,
        numberOfTransactions: 5
      }];

      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);
      fixture.detectChanges();

      const formatted = component.formattedLeaderboardValues();
      expect(formatted[0].planet).toBe('unknown');
    });

    it('should format multiple leaderboard entries', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet2', name: 'Mars', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] },
        { id: 'planet3', name: 'Venus', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];

      const mockLeaderboard: LeaderboardModel[] = [
        { planetId: 'planet1', sumTransactionValue: 1000, numberOfTransactions: 10 },
        { planetId: 'planet2', sumTransactionValue: 2000, numberOfTransactions: 15 },
        { planetId: 'planet3', sumTransactionValue: 1500, numberOfTransactions: 12 }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);
      fixture.detectChanges();

      const formatted = component.formattedLeaderboardValues();
      expect(formatted).toHaveLength(3);
      expect(formatted[0].planet).toBe('Earth');
      expect(formatted[1].planet).toBe('Mars');
      expect(formatted[2].planet).toBe('Venus');
    });

    it('should format number of transactions with decimals', () => {
      const mockLeaderboard: LeaderboardModel[] = [{
        planetId: 'planet1',
        sumTransactionValue: 1000.567,
        numberOfTransactions: 10.789
      }];

      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);
      fixture.detectChanges();

      const formatted = component.formattedLeaderboardValues();
      expect(formatted[0].formattedNumberOfTransactions).toBe('10.79');
    });

    it('should return empty array when no leaderboard values', () => {
      const formatted = component.formattedLeaderboardValues();
      expect(formatted).toEqual([]);
    });
  });

  describe('displayedColumns', () => {
    it('should have correct transaction columns', () => {
      expect(component.transactionDisplayedColumns).toEqual([
        'time', 'product', 'planet', 'transactionType', 'pricePerUnit', 'volume', 'sum'
      ]);
    });

    it('should have correct leaderboard columns', () => {
      expect(component.leaderboardDisplayedColumns).toEqual([
        'planet', 'sum', 'transaction'
      ]);
    });
  });

  describe('trackBy functions', () => {
    it('should track transactions by id', () => {
      const transaction: TransactionModel = {
        id: 'tx123',
        timeStamp: new Date().toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet1',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5
      };

      expect(component.transactionTrackBy(0, transaction)).toBe('tx123');
      expect(component.transactionTrackBy(5, transaction)).toBe('tx123');
    });

    it('should track leaderboard by planetId', () => {
      const leaderboard: LeaderboardModel = {
        planetId: 'planet1',
        sumTransactionValue: 1000,
        numberOfTransactions: 10
      };

      expect(component.leaderboardTrackBy(0, leaderboard)).toBe('planet1');
      expect(component.leaderboardTrackBy(3, leaderboard)).toBe('planet1');
    });

    it('should return consistent tracking values', () => {
      const transaction: TransactionModel = {
        id: 'unique-id-456',
        timeStamp: new Date().toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet2',
        transactionType: TransactionType.SELL,
        pricePerUnit: 15,
        volume: 8
      };

      const result1 = component.transactionTrackBy(0, transaction);
      const result2 = component.transactionTrackBy(0, transaction);
      expect(result1).toBe(result2);
      expect(result1).toBe('unique-id-456');
    });
  });

  describe('component integration', () => {
    it('should render without errors when all inputs provided', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth', currency: Currency.USD, locale: 'en-US', temperatureUnit: TemperatureUnit.CELSIUS, weather: 'Clear', climateZones: [], population: 1000000, sector: 'Alpha', energySources: [] }
      ];
      const mockTransactions: TransactionModel[] = [{
        id: 'tx1',
        timeStamp: new Date().toISOString(),
        product: ProductType.ENERGY,
        planetId: 'planet1',
        transactionType: TransactionType.BUY,
        pricePerUnit: 10,
        volume: 5
      }];
      const mockLeaderboard: LeaderboardModel[] = [{
        planetId: 'planet1',
        sumTransactionValue: 1000,
        numberOfTransactions: 10
      }];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty inputs gracefully', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.transactions()).toEqual([]);
      expect(component.formattedLeaderboardValues()).toEqual([]);
    });
  });
});
