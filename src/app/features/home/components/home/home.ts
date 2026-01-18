import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterOutlet} from "@angular/router";
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {TranslocoDirective} from '@jsverse/transloco';

@Component({
  selector: 'app-home',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    RouterOutlet,
    TranslocoDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly planetStore = inject(PlanetStore);

  ngOnInit() {
    this.planetStore.loadPlanets();
  }

  public onLogout() {
    this.authenticationStore.logout();
  }
}
