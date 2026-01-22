import {HttpInterceptorFn} from '@angular/common/http';
import {catchError, retry, throwError, timer} from 'rxjs';

const RETRY_NUMBER = 2;
const RETRY_DELAY_MS = 1000;

export const retryHttpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: RETRY_NUMBER,
      delay: () => timer(RETRY_DELAY_MS),
    }),
    catchError((error) => {
      console.error('Request failed after retries:', error);
      return throwError(() => error);
    })
  );
};
