import {TestBed, tick} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { UserModel } from '../models/user.model';
import { CredentialsModel } from '../models/credentials.model';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {patchState} from '@ngrx/signals';

describe('AuthenticationStore', () => {
  let store: any;
  let mockAuthService: any;
  let mockRouter: any;

  const mockUser: UserModel = { id: '1', name: 'Test User', email: 'test@example.com', planetId: '1' } as UserModel;
  const credentials: CredentialsModel = { email: 'test@example.com', password: 'password' };

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
    };
    mockRouter = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthenticationStore,
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    store = TestBed.inject(AuthenticationStore);
  });

  it('should initialize with correct initial state', () => {
    expect(store.user()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.isLoggedIn()).toBe(false);
  });

  it('should compute isLoggedIn correctly', () => {
    expect(store.isLoggedIn()).toBe(false);
  });

  describe('login success', () => {
    beforeEach(() => {
      mockAuthService.login.mockReturnValue(of(mockUser));
    });

    it('should set loading true, clear error, set user, set loading false, and navigate on success', async () => {
      store.login(credentials);

      TestBed.tick();

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(store.user()).toEqual(mockUser);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.isLoggedIn()).toBe(true);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
    });
  });

  describe('login error', () => {
    beforeEach(() => {
      const error = { message: 'Invalid credentials' };
      mockAuthService.login.mockReturnValue(throwError(() => error));
    });

    it('should set loading true, clear error initially, then set error and loading false on failure', async () => {
      store.login(credentials);

      TestBed.tick();

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(store.user()).toBeNull();
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toEqual({ message: 'Invalid credentials' });
      expect(store.isLoggedIn()).toBe(false);
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('logout success', () => {
    beforeEach(() => {
      mockAuthService.logout.mockReturnValue(of(void 0));
    });

    it('should set loading true, clear error, clear user, set loading false, and navigate on success', async () => {
      patchState(store, {user: mockUser});

      store.logout();

      TestBed.tick();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(store.user()).toBeNull();
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.isLoggedIn()).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth', { replaceUrl: true });
    });
  });
});
