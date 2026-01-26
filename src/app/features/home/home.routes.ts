import {Routes} from '@angular/router';
import {Home} from './components/home/home';
import {hasRole} from '@core/auth/guards/role.guard';
import {Role} from '@core/auth/models/role';

export const HOME_ROUTES: Routes = [
  {
    path: 'admin',
    component: Home,
    loadChildren: () => import('../admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [hasRole([Role.ADMIN])],
  },
  {
    path: 'dashboard',
    component: Home,
    loadChildren: () => import('../dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'planets',
    component: Home,
    loadChildren: () => import('../planet-profile/planet-profile.routes').then(m => m.PLANET_PROFILE_ROUTES),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
