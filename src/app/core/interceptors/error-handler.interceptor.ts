import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {ErrorHandlerService} from '@core/error/services/error-handler.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandlerService = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'error.unexpectedError';

      if (error?.error?.message) {
        message = error?.error?.message;
      }

      errorHandlerService.showError(message)
      return throwError(() => error);
    })
  );
};
