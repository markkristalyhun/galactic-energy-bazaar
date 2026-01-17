import {ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy} from '@angular/core';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Dashboard} from '../dashboard/dashboard';
import {TransactionStore} from '@core/transaction/stores/transaction.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    Dashboard
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnDestroy {
  private readonly planetStore = inject(PlanetStore);
  private readonly transactionStore = inject(TransactionStore);

  public readonly transactions = this.transactionStore.transactions;
  protected readonly isLoading = this.planetStore.isLoading;

  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.transactionStore.connected()) {
        this.transactionStore.startWatching();
      }
    });
  }

  ngOnDestroy() {
    this.transactionStore.stopWatching();
  }
}
