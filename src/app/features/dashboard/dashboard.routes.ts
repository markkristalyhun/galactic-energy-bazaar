import {Routes} from '@angular/router';
import {DashboardPage} from './components/dashboard-page/dashboard-page';
import {provideTranslocoScope} from '@jsverse/transloco';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage,
    providers: [provideTranslocoScope('dashboard')]
  }
];
