import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
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

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatButton,
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
    CdkRecycleRows
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  public readonly transactions = input<TransactionModel[]>([]);

  public readonly displayedColumns = ['time', 'product'];

  public trackBy(index: number, element: TransactionModel): string {
    return element.id;
  }
}
