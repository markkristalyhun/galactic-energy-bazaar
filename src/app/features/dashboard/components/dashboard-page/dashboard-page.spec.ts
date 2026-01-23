import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { DashboardPage } from './dashboard-page';
import { PlanetStore } from '@core/planet/stores/planet.store';
import { TransactionStore } from '@core/transaction/stores/transaction.store';
import {TranslocoTestingModule} from '@jsverse/transloco';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let mockPlanetStore: any;
  let mockTransactionStore: any;

  beforeEach(async () => {
    mockPlanetStore = {
      planets: signal([]),
      isLoading: signal(false)
    };

    mockTransactionStore = {
      transactions: signal([]),
      leaderboardValues: signal([]),
      connected: signal(false),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardPage,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
        }),
      ],
      providers: [
        { provide: PlanetStore, useValue: mockPlanetStore },
        { provide: TransactionStore, useValue: mockTransactionStore },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Store Integration', () => {
    it('should expose transactions from TransactionStore', () => {
      const mockTransactions = [
        { id: 'tx1', product: 'Widget', planetId: 'planet1' }
      ];
      mockTransactionStore.transactions.set(mockTransactions);

      expect(component.transactions()).toEqual(mockTransactions);
    });

    it('should expose leaderboard values from TransactionStore', () => {
      const mockLeaderboard = [
        { planetId: 'planet1', sumTransactionValue: 1000, numberOfTransactions: 10 }
      ];
      mockTransactionStore.leaderboardValues.set(mockLeaderboard);

      expect(component.leaderboardValues()).toEqual(mockLeaderboard);
    });

    it('should expose planets from PlanetStore', () => {
      const mockPlanets = [
        { id: 'planet1', name: 'Earth' }
      ];
      mockPlanetStore.planets.set(mockPlanets);

      expect(component.planets()).toEqual(mockPlanets);
    });

    it('should expose isLoading from PlanetStore', () => {
      mockPlanetStore.isLoading.set(true);

      expect(component['isLoading']()).toBe(true);
    });
  });

  describe('Effect behavior', () => {
    it('should start watching when not loading and not connected', () => {
      mockPlanetStore.isLoading.set(false);
      mockTransactionStore.connected.set(false);

      fixture.detectChanges();

      expect(mockTransactionStore.startWatching).toHaveBeenCalled();
    });

    it('should not start watching when still loading', () => {
      mockPlanetStore.isLoading.set(true);
      mockTransactionStore.connected.set(false);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionStore.startWatching).not.toHaveBeenCalled();
    });

    it('should not start watching when already connected', () => {
      mockPlanetStore.isLoading.set(false);
      mockTransactionStore.connected.set(true);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionStore.startWatching).not.toHaveBeenCalled();
    });

    it('should react to loading state changes', () => {
      mockPlanetStore.isLoading.set(true);
      mockTransactionStore.connected.set(false);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionStore.startWatching).not.toHaveBeenCalled();

      // Simulate loading complete
      mockPlanetStore.isLoading.set(false);
      fixture.detectChanges();

      expect(mockTransactionStore.startWatching).toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('should stop watching on destroy', () => {
      fixture.detectChanges();

      fixture.destroy();

      expect(mockTransactionStore.stopWatching).toHaveBeenCalled();
    });

    it('should cleanup properly when destroyed multiple times', () => {
      fixture.detectChanges();

      fixture.destroy();
      expect(mockTransactionStore.stopWatching).toHaveBeenCalledTimes(1);

      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('Template rendering', () => {
    it('should render dashboard-skeleton when loading', () => {
      mockPlanetStore.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const skeleton = compiled.querySelector('app-dashboard-skeleton');
      const dashboard = compiled.querySelector('app-dashboard');

      expect(skeleton).toBeTruthy();
      expect(dashboard).toBeFalsy();
    });

    it('should render dashboard when not loading', () => {
      mockPlanetStore.isLoading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const skeleton = compiled.querySelector('app-dashboard-skeleton');
      const dashboard = compiled.querySelector('app-dashboard');

      expect(skeleton).toBeFalsy();
      expect(dashboard).toBeTruthy();
    });

    it('should pass data to dashboard component', () => {
      const mockTransactions = [{ id: 'tx1', product: 'Widget', timeStamp: (new Date()).toISOString() }];
      const mockLeaderboard = [{ planetId: 'p1', sumTransactionValue: 100 }];
      const mockPlanets = [{ id: 'p1', name: 'Earth' }];

      mockTransactionStore.transactions.set(mockTransactions);
      mockTransactionStore.leaderboardValues.set(mockLeaderboard);
      mockPlanetStore.planets.set(mockPlanets);
      mockPlanetStore.isLoading.set(false);

      fixture.detectChanges();

      const dashboardElement = fixture.nativeElement.querySelector('app-dashboard');
      expect(dashboardElement).toBeTruthy();
    });
  });
});
