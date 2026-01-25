import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {ErrorHandlerService} from '@core/error/services/error-handler.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for requests marked as silent
      if (req.headers.has('X-Skip-Error-Handler')) {
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
