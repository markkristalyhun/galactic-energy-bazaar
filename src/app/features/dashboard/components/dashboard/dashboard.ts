import {Component, inject} from '@angular/core';
import {PlanetStore} from '@core/planet/stores/planet.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly planetStore = inject(PlanetStore);

  protected readonly isLoading = this.planetStore.isLoading;

  constructor() {
    this.planetStore.loadPlanets();
  }
}
