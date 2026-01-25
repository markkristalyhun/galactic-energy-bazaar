import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorHandlerInterceptor } from './error-handler.interceptor';
import { AuthenticationStore } from '@core/auth/stores/authentication.store';
import { ErrorHandlerService } from '@core/error/services/error-handler.service';
import { provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('errorHandlerInterceptor - 401 Handling', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authenticationStore: InstanceType<typeof AuthenticationStore>;
  let errorHandlerService: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
        }),
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorHandlerInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authenticationStore = TestBed.inject(AuthenticationStore);
    errorHandlerService = TestBed.inject(ErrorHandlerService);
  });

  it('should handle 401 unauthorized and trigger automatic logout', () => {
    const clearSessionSpy = vi.spyOn(authenticationStore, 'clearSession');
    const showErrorSpy = vi.spyOn(errorHandlerService, 'showError');

    // Make a request that will return 401
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Verify clearSession was called (which handles all cleanup internally)
    expect(clearSessionSpy).toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('error.sessionExpired');
  });

  it('should skip error handling for requests with X-Skip-Error-Handler header', () => {
    const clearSessionSpy = vi.spyOn(authenticationStore, 'clearSession');
    const showErrorSpy = vi.spyOn(errorHandlerService, 'showError');

    // Make a request with skip header
    httpClient
      .get('/api/session', {
        headers: { 'X-Skip-Error-Handler': 'true' },
      })
      .subscribe({
        next: () => {},
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

    const req = httpTestingController.expectOne('/api/session');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Verify no cleanup was triggered
    expect(clearSessionSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle non-401 errors normally', () => {
    const clearSessionSpy = vi.spyOn(authenticationStore, 'clearSession');
    const showErrorSpy = vi.spyOn(errorHandlerService, 'showError');

    // Make a request that will return 500
    httpClient.get('/api/test').subscribe({
      next: () => {},
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush(
      { message: 'error.serverError' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    // Verify logout was not triggered but error was shown
    expect(clearSessionSpy).not.toHaveBeenCalled();
    expect(showErrorSpy).toHaveBeenCalledWith('error.serverError');
  });
});
