import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {Dashboard} from './dashboard';
import {LOCALE_ID} from '@angular/core';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {PlanetModel} from '@core/planet/models/planet.model';
import {TransactionModel, TransactionType} from '@core/transaction/models/transaction.model';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';
import {ProductType} from '@core/transaction/models/product.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
        })
      ],
      providers: [
        { provide: LOCALE_ID, useValue: 'en-US' }
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

  describe('planetMap computed signal', () => {
    it('should create a map of planets by id', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth' },
        { id: 'planet2', name: 'Mars' }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.detectChanges();

      const planetMap = component['planetMap']();
      expect(planetMap.get('planet1')?.name).toBe('Earth');
      expect(planetMap.get('planet2')?.name).toBe('Mars');
    });
  });

  describe('formattedTransactions computed signal', () => {
    it('should format transactions with planet names and calculated sum', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth' }
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
        }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      const formatted = component.formattedTransactions();
      expect(formatted[0].planet).toBe('Earth');
      expect(formatted[0].sum).toBe(50);
      expect(formatted[0].time).toBeDefined();
    });

    it('should fallback to planetId when planet not found', () => {
      const mockTransactions: TransactionModel[] = [
        {
          id: 'tx1',
          timeStamp: new Date().toISOString(),
          product: ProductType.ENERGY,
          planetId: 'unknown',
          transactionType: TransactionType.BUY,
          pricePerUnit: 10,
          volume: 5
        }
      ];

      fixture.componentRef.setInput('transactions', mockTransactions);
      fixture.detectChanges();

      const formatted = component.formattedTransactions();
      expect(formatted[0].planet).toBe('unknown');
    });
  });

  describe('formattedLeaderboardValues computed signal', () => {
    it('should format leaderboard with planet names', () => {
      const mockPlanets: PlanetModel[] = [
        { id: 'planet1', name: 'Earth' }
      ];
      const mockLeaderboard: LeaderboardModel[] = [
        {
          planetId: 'planet1',
          sumTransactionValue: 1000,
          numberOfTransactions: 10
        }
      ];

      fixture.componentRef.setInput('planets', mockPlanets);
      fixture.componentRef.setInput('leaderboardValues', mockLeaderboard);
      fixture.detectChanges();

      const formatted = component.formattedLeaderboardValues();
      expect(formatted[0].planet).toBe('Earth');
      expect(formatted[0].sumTransactionValue).toBe(1000);
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
    });

    it('should track leaderboard by planetId', () => {
      const leaderboard: LeaderboardModel = {
        planetId: 'planet1',
        sumTransactionValue: 1000,
        numberOfTransactions: 10
      };

      expect(component.leaderboardTrackBy(0, leaderboard)).toBe('planet1');
    });
  });
});

