import {CanActivateFn, Router} from '@angular/router';
import {Role} from '@core/auth/models/role';
import {inject} from '@angular/core';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

export const hasRole: (requiredRoles: Role[]) => CanActivateFn = (requiredRoles) => {
  return () => {
    const authStore = inject(AuthenticationStore);
    const router = inject(Router);

    const role = authStore.role();
    if (!role || !requiredRoles.includes(role)) {
      return router.createUrlTree(['/unauthorized']);
    }
    return true;
  };
};
