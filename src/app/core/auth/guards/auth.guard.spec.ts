import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isAuthenticatedGuard } from './auth.guard';
import { AuthenticationStore } from '../stores/authentication.store';
import { signal } from '@angular/core';

describe('isAuthenticatedGuard', () => {
  let mockRouter: any;
  let mockAuthStore: any;

  beforeEach(() => {
    mockRouter = {
      createUrlTree: vi.fn((commands: any[]) => {
        return { urlTree: commands } as any as UrlTree;
      })
    };

    mockAuthStore = {
      isLoggedIn: signal(false)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationStore, useValue: mockAuthStore }
      ]
    });
  });

  it('should return true when user is authenticated', () => {
    mockAuthStore.isLoggedIn.set(true);

    const result = TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should redirect to /auth when user is not authenticated', () => {
    mockAuthStore.isLoggedIn.set(false);

    const result = TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard({} as any, {} as any)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth']);
    expect(result).toBeTruthy();
  });

  it('should not call router.createUrlTree when authenticated', () => {
    mockAuthStore.isLoggedIn.set(true);

    TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard({} as any, {} as any)
    );

    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should handle authentication state changes', () => {
    // First call - not authenticated
    mockAuthStore.isLoggedIn.set(false);

    let result = TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard({} as any, {} as any)
    );

    expect(result).not.toBe(true);

    // Second call - authenticated
    mockAuthStore.isLoggedIn.set(true);

    result = TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should work with actual route and state parameters', () => {
    mockAuthStore.isLoggedIn.set(true);

    const mockRoute: any = {
      params: { id: '123' },
      queryParams: { tab: 'details' }
    };

    const mockState: any = {
      url: '/dashboard',
      root: mockRoute
    };

    const result = TestBed.runInInjectionContext(() =>
      isAuthenticatedGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });
});
