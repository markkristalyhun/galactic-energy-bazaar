import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthenticationStore} from '../stores/authentication.store';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authenticationStore = inject(AuthenticationStore);

  if (authenticationStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/auth']);
}
