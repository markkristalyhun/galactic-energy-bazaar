import {ChangeDetectionStrategy, Component, effect, inject, OnDestroy, signal, viewChild} from '@angular/core';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {Dashboard} from '../dashboard/dashboard';
import {DashboardSkeleton} from '../dashboard-skeleton/dashboard-skeleton';
import {ErrorHandlerService} from '@core/error/services/error-handler.service';
import {TransactionService} from '@core/transaction/services/transaction.service';
import {TransactionModel} from '@core/transaction/models/transaction.model';
import {combineLatest, filter, switchMap, take} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';

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
  private readonly transactionService = inject(TransactionService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  public readonly dashboard = viewChild(Dashboard);

  public readonly transactions = signal<TransactionModel[]>([]);
  public readonly leaderboardValues = signal<LeaderboardModel[]>([]);
  public readonly planets = this.planetStore.planets;
  public readonly isLoading = this.planetStore.isLoading;

  protected readonly isLoading$ = toObservable(this.planetStore.isLoading);

  constructor() {
    combineLatest([this.isLoading$, this.transactionService.isConnected]).pipe(
      filter(([isLoading, isConnected]) => !isLoading && !isConnected),
      take(1),
      switchMap(() => this.transactionService.connect()),
      takeUntilDestroyed(),
    ).subscribe((data) => {
      this.transactions.set(data.transactions);
      this.leaderboardValues.set(data.leaderboardValues);
      this.dashboard()?.refreshTableData();
    });

    effect(() => {
      const transactionError = this.transactionService.transactionError();
      if (transactionError) {
        this.errorHandlerService.showError(transactionError);
      }
    });
  }

  ngOnDestroy() {
    this.transactionService.disconnect();
  }
}
