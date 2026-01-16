import {Routes} from '@angular/router';
import {Home} from './components/home/home';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: Home,
    loadChildren: () => import('../dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  }
];
