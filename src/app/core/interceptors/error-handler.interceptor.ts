import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, throwError} from 'rxjs';
import {TranslocoService} from '@jsverse/transloco';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const translateService = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'error.unexpectedError';

      if (error?.error?.message) {
        message = error?.error?.message;
      }

      snackBar.open(translateService.translate(message), translateService.translate('action.close'), {
        duration: 50000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });

      return throwError(() => error);
    })
  );
};
