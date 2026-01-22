import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRecycleRows,
  CdkRow,
  CdkRowDef,
  CdkTable
} from '@angular/cdk/table';
import {TransactionModel} from '@core/transaction/models/transaction.model';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';
import {TranslocoDirective, TranslocoService} from '@jsverse/transloco';
import {PlanetModel} from '@core/planet/models/planet.model';
import {formatDate, formatNumber} from '@angular/common';
import {UserCurrencyPipe} from '@core/currency/pipes/user-currency.pipe';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    CdkVirtualScrollViewport,
    CdkTable,
    CdkFixedSizeVirtualScroll,
    CdkColumnDef,
    CdkHeaderCell,
    CdkCell,
    CdkCellDef,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkRow,
    CdkRowDef,
    CdkHeaderRowDef,
    CdkRecycleRows,
    TranslocoDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly userCurrencyPipe = inject(UserCurrencyPipe);
  private readonly translateService = inject(TranslocoService);

  public readonly transactions = input<TransactionModel[]>([]);
  public readonly leaderboardValues = input<LeaderboardModel[]>([]);
  public readonly planets = input<PlanetModel[]>([]);

  private readonly planetMap = computed(() => {
    const planetMap = new Map<string, PlanetModel>();
    this.planets().forEach(planet => planetMap.set(planet.id, planet));
    return planetMap;
  });

  public readonly formattedTransactions = computed(() =>
    this.transactions().map(transaction => ({
      ...transaction,
      time: formatDate(transaction.timeStamp, 'medium', this.authenticationStore.userLocale()),
      planet: this.planetMap().get(transaction.planetId)?.name ?? transaction.planetId,
      formattedPricePerUnit: this.userCurrencyPipe.transform(transaction.pricePerUnit),
      sum: this.userCurrencyPipe.transform(transaction.volume * transaction.pricePerUnit),
      formattedProduct: this.translateService.translate(`product.${transaction.product}`),
      formattedTransactionType: this.translateService.translate(`transaction.${transaction.transactionType}`),
      formattedVolume: formatNumber(transaction.volume, this.authenticationStore.userLocale(), '1.0-2'),
    }))
  );

  public readonly formattedLeaderboardValues = computed(() =>
    this.leaderboardValues().map(leaderboardValue => ({
      ...leaderboardValue,
      planet: this.planetMap().get(leaderboardValue.planetId)?.name ?? leaderboardValue.planetId,
      sum: this.userCurrencyPipe.transform(leaderboardValue.sumTransactionValue),
      formattedNumberOfTransactions: formatNumber(leaderboardValue.numberOfTransactions, this.authenticationStore.userLocale(), '1.0-2'),
    })),
  );

  public readonly transactionDisplayedColumns = ['time', 'product', 'planet', 'transactionType', 'pricePerUnit', 'volume', 'sum'];
  public readonly leaderboardDisplayedColumns = ['planet', 'sum', 'transaction'];

  public transactionTrackBy(index: number, element: TransactionModel): string {
    return element.id;
  }

  public leaderboardTrackBy(index: number, element: LeaderboardModel): string {
    return element.planetId;
  }
}
