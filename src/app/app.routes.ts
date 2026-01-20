import {Routes} from '@angular/router';
import {isAuthenticatedGuard} from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/authentication/authentication.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES),
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./core/auth/components/forbidden/forbidden').then(m => m.Forbidden),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];
