import {ChangeDetectionStrategy, Component, effect, inject, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import {HasRoleDirective} from '@core/auth/directives/has-role.directive';
import {Role} from '@core/auth/models/role';
import {CurrencyStore} from '@core/currency/stores/currency.store';

@Component({
  selector: 'app-home',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    RouterOutlet,
    TranslocoDirective,
    MatButton,
    RouterLink,
    RouterLinkActive,
    HasRoleDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly planetStore = inject(PlanetStore);
  private readonly currencyStore = inject(CurrencyStore);

  protected readonly Role = Role;

  ngOnInit() {
    this.planetStore.loadPlanets();
    this.currencyStore.startPolling();
  }

  public onLogout() {
    this.currencyStore.stopPolling();
    this.authenticationStore.logout();
  }
}
