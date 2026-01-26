import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {CommonModule} from '@angular/common';
import {TranslocoDirective} from '@jsverse/transloco';
import {PlanetModel} from '@core/planet/models/planet.model';

@Component({
  selector: 'app-planet-info',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    TranslocoDirective
  ],
  templateUrl: './planet-info.html',
  styleUrls: ['./planet-info.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetInfoComponent {
  public readonly planet = input.required<PlanetModel>();
  public readonly locale = input.required<string>();
}
