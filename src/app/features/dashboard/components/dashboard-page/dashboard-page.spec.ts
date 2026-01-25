import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { DashboardPage } from './dashboard-page';
import { PlanetStore } from '@core/planet/stores/planet.store';
import { TransactionService } from '@core/transaction/services/transaction.service';
import {TranslocoTestingModule} from '@jsverse/transloco';
import { of, BehaviorSubject } from 'rxjs';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let mockPlanetStore: any;
  let mockTransactionService: any;
  let isConnectedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    mockPlanetStore = {
      planets: signal([]),
      isLoading: signal(false)
    };

    isConnectedSubject = new BehaviorSubject<boolean>(false);

    mockTransactionService = {
      isConnected: isConnectedSubject.asObservable(),
      transactionError: signal(null),
      connect: vi.fn().mockReturnValue(of({ transactions: [], leaderboardValues: [] })),
      disconnect: vi.fn(),
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
        { provide: TransactionService, useValue: mockTransactionService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Store Integration', () => {
    it('should have empty transactions initially', () => {
      expect(component.transactions()).toEqual([]);
    });

    it('should have empty leaderboard values initially', () => {
      expect(component.leaderboardValues()).toEqual([]);
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

      expect(component.isLoading()).toBe(true);
    });
  });

  describe('Effect behavior', () => {
    it('should connect when not loading and not connected', () => {
      mockPlanetStore.isLoading.set(false);
      isConnectedSubject.next(false);

      fixture.detectChanges();

      expect(mockTransactionService.connect).toHaveBeenCalled();
    });

    it('should not connect when still loading', () => {
      mockPlanetStore.isLoading.set(true);
      isConnectedSubject.next(false);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionService.connect).not.toHaveBeenCalled();
    });

    it('should not connect when already connected', () => {
      mockPlanetStore.isLoading.set(false);
      isConnectedSubject.next(true);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionService.connect).not.toHaveBeenCalled();
    });

    it('should react to loading state changes', () => {
      mockPlanetStore.isLoading.set(true);
      isConnectedSubject.next(false);

      vi.clearAllMocks();
      fixture.detectChanges();

      expect(mockTransactionService.connect).not.toHaveBeenCalled();

      // Simulate loading complete
      mockPlanetStore.isLoading.set(false);
      fixture.detectChanges();

      expect(mockTransactionService.connect).toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    it('should disconnect on destroy', () => {
      fixture.detectChanges();

      fixture.destroy();

      expect(mockTransactionService.disconnect).toHaveBeenCalled();
    });

    it('should cleanup properly when destroyed multiple times', () => {
      fixture.detectChanges();

      fixture.destroy();
      expect(mockTransactionService.disconnect).toHaveBeenCalledTimes(1);

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
      mockPlanetStore.planets.set([{ id: 'p1', name: 'Earth' }]);
      mockPlanetStore.isLoading.set(false);

      fixture.detectChanges();

      const dashboardElement = fixture.nativeElement.querySelector('app-dashboard');
      expect(dashboardElement).toBeTruthy();
    });
  });
});
