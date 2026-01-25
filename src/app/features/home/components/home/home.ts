import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {TranslocoDirective} from '@jsverse/transloco';
import {HasRoleDirective} from '@core/auth/directives/has-role.directive';
import {Role} from '@core/auth/models/role';
import {CurrencyStore} from '@core/currency/stores/currency.store';
import {TransactionService} from '@core/transaction/services/transaction.service';

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
export class Home implements OnInit, OnDestroy {
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly planetStore = inject(PlanetStore);
  private readonly currencyStore = inject(CurrencyStore);
  private readonly transactionService = inject(TransactionService);

  protected readonly Role = Role;

  ngOnInit() {
    this.planetStore.loadPlanets();
    this.currencyStore.startPolling();
  }

  public onLogout() {
    this.currencyStore.stopPolling();
    this.authenticationStore.logout();
  }

  ngOnDestroy() {
    this.transactionService.resetData();
    this.planetStore.reset();
    this.currencyStore.reset();
  }
}
