import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Dashboard} from '../dashboard/dashboard';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    Dashboard
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly planetStore = inject(PlanetStore);

  protected readonly isLoading = this.planetStore.isLoading;

  constructor() {
    this.planetStore.loadPlanets();
  }
}
