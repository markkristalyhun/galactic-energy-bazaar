import {Routes} from '@angular/router';
import {provideTranslocoScope} from '@jsverse/transloco';

export const PLANET_PROFILE_ROUTES: Routes = [
  {
    path: ':planetId',
    loadComponent: () => import('./components/planet-profile-page/planet-profile-page').then(m => m.PlanetProfilePage),
    providers: [provideTranslocoScope('planet')]
  },
];
