import { Routes } from '@angular/router';
import {isAuthenticatedGuard} from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/authentication/authentication.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];
