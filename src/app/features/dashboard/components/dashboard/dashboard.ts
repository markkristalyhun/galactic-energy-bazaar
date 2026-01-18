import {ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID} from '@angular/core';
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
import {TranslocoDirective} from '@jsverse/transloco';
import {PlanetModel} from '@core/planet/models/planet.model';
import {formatDate} from '@angular/common';

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
  private locale = inject(LOCALE_ID);

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
      time: formatDate(transaction.timeStamp, 'medium', this.locale), // TODO get locale from planet/user data
      planet: this.planetMap().get(transaction.planetId)?.name ?? transaction.planetId,
      sum: transaction.volume * transaction.pricePerUnit,
    }))
  );

  public readonly formattedLeaderboardValues = computed(() =>
    this.leaderboardValues().map(leaderboardValue => ({
      ...leaderboardValue,
      planet: this.planetMap().get(leaderboardValue.planetId)?.name ?? leaderboardValue.planetId,
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
