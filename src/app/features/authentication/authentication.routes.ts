import {Routes} from '@angular/router';
import {Login} from './components/login/login';
import {provideTranslocoScope} from '@jsverse/transloco';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: Login,
    providers: [provideTranslocoScope('auth')]
  }
];
