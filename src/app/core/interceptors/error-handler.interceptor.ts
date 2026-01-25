import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {ErrorHandlerService} from '@core/error/services/error-handler.service';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

let isLoggingOut = false;

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);
  const authenticationStore = inject(AuthenticationStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for requests marked as silent
      if (req.headers.has('X-Skip-Error-Handler')) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized - session expired or invalid
      if (error.status === 401 && !isLoggingOut) {
        isLoggingOut = true;

        // AuthenticationStore handles all cleanup internally
        authenticationStore.clearSession();

        // Show session expired message
        errorHandlerService.showError('error.sessionExpired');

        isLoggingOut = false;

        return throwError(() => error);
      }

      let message = 'error.unexpectedError';

      if (error?.error?.message) {
        message = error?.error?.message;
      }

      errorHandlerService.showError(message)
      return throwError(() => error);
    })
  );
};
