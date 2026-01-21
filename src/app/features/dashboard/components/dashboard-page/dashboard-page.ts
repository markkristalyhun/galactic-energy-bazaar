import {ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, signal} from '@angular/core';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Dashboard} from '../dashboard/dashboard';
import {TransactionStore} from '@core/transaction/stores/transaction.store';
import {DashboardSkeleton} from '../dashboard-skeleton/dashboard-skeleton';
import {ErrorHandlerService} from '@core/error/services/error-handler.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    Dashboard,
    DashboardSkeleton
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnDestroy {
  private readonly planetStore = inject(PlanetStore);
  private readonly transactionStore = inject(TransactionStore);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  public readonly transactions = this.transactionStore.transactions;
  public readonly leaderboardValues = this.transactionStore.leaderboardValues;
  public readonly planets = this.planetStore.planets;
  protected readonly isLoading = this.planetStore.isLoading;

  constructor() {
    // TODO
    effect(() => {
      if (!this.isLoading() && !this.transactionStore.connected()) {
        this.transactionStore.startWatching();
      }
    });

    effect(() => {
      const transactionError = this.transactionStore.error();
      if (transactionError) {
        console.log(transactionError);
        this.errorHandlerService.showError(transactionError);
      }
    });
  }

  ngOnDestroy() {
    this.transactionStore.stopWatching();
  }
}
