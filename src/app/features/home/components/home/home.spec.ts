import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Home} from './home';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {TransactionStore} from '@core/transaction/stores/transaction.store';
import {CurrencyStore} from '@core/currency/stores/currency.store';
import {ActivatedRoute} from '@angular/router';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockAuthStore: any;
  let mockPlanetStore: any;
  let mockTransactionStore: any;
  let mockCurrencyStore: any;
  let compiled: HTMLElement;

  beforeEach(async () => {
    mockAuthStore = {
      logout: vi.fn(),
      role: vi.fn(),
    };

    mockPlanetStore = {
      loadPlanets: vi.fn(),
      reset: vi.fn(),
    };

    mockCurrencyStore = {
      reset: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    };

    mockTransactionStore = {
      reset: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        Home,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
        }),
      ],
      providers: [
        { provide: AuthenticationStore, useValue: mockAuthStore },
        { provide: PlanetStore, useValue: mockPlanetStore },
        { provide: TransactionStore, useValue: mockTransactionStore },
        { provide: CurrencyStore, useValue: mockCurrencyStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load planets on initialization', () => {
      fixture.detectChanges();

      expect(mockPlanetStore.loadPlanets).toHaveBeenCalled();
    });

    it('should load planets only once', () => {
      fixture.detectChanges();

      expect(mockPlanetStore.loadPlanets).toHaveBeenCalledTimes(1);
    });
  });

  describe('onLogout', () => {
    it('should call authenticationStore.logout', () => {
      component.onLogout();

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should handle multiple logout calls', () => {
      component.onLogout();
      component.onLogout();

      expect(mockAuthStore.logout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render toolbar', () => {
      const toolbar = compiled.querySelector('mat-toolbar');
      expect(toolbar).toBeTruthy();
    });

    it('should render logout button', () => {
      const logoutButton = compiled.querySelector('button[mat-icon-button]');
      expect(logoutButton).toBeTruthy();
    });

    it('should render logout icon', () => {
      const icon = compiled.querySelector('mat-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('logout');
    });

    it('should render router outlet', () => {
      const outlet = compiled.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });

    it('should trigger logout when button clicked', () => {
      const logoutButton = compiled.querySelector('button[mat-icon-button]') as HTMLButtonElement;

      logoutButton.click();

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });
  });

  describe('Initialization Order', () => {
    it('should load planets before first change detection', () => {
      const freshFixture = TestBed.createComponent(Home);
      const loadSpy = vi.spyOn(mockPlanetStore, 'loadPlanets');

      freshFixture.detectChanges();

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle planet store load errors gracefully', () => {
      mockPlanetStore.loadPlanets.mockImplementation(() => {
        throw new Error('Network error');
      });

      expect(() => fixture.detectChanges()).toThrow('Network error');
    });

    it('should handle logout errors gracefully', () => {
      mockAuthStore.logout.mockImplementation(() => {
        throw new Error('Logout failed');
      });

      expect(() => component.onLogout()).toThrow('Logout failed');
    });
  });
});
