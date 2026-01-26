import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {PlanetInfoComponent} from '../planet-info/planet-info';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

@Component({
  selector: 'app-planet-profile-page',
  imports: [
    PlanetInfoComponent
  ],
  templateUrl: './planet-profile-page.html',
  styleUrl: './planet-profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetProfilePage {
  private readonly planetStore = inject(PlanetStore);
  private readonly authenticationStore = inject(AuthenticationStore);

  public readonly planetId = input.required<string>();

  public readonly planetInfo = this.planetStore.planetInfo;
  public readonly isLoading = this.planetStore.isLoading;
  public readonly userLocale = this.authenticationStore.userLocale;

  constructor() {
    effect(() => {
      const id = this.planetId();
      if (id) {
        this.planetStore.loadPlanetById(id);
      }
    });
  }
}
