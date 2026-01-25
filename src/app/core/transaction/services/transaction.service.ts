import {Injectable, signal} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {TransactionModel} from '@core/transaction/models/transaction.model';
import {bufferTime, filter, map, Observable, retry, Subscription, tap, timer} from 'rxjs';
import {webSocket} from 'rxjs/webSocket';
import {environment} from '@env/environment';
import {toObservableSignal} from 'ngxtension/to-observable-signal';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';

const MAX_TRANSACTION_SIZE = 10000;
const MAX_RETRIES = 10;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private webSocket$: WebSocketSubject<TransactionModel> | null = null;
  private transactions: TransactionModel[] = [];
  private leaderboardValues: LeaderboardModel[] = [];
  private connectionSubscription: Subscription | null = null;

  public readonly isConnected = toObservableSignal(signal<boolean>(false));
  public readonly transactionError = signal<string | null>(null);

  public disconnect() {
    this.connectionSubscription?.unsubscribe();
    this.webSocket$?.complete();
    this.webSocket$ = null;
  }

  public connect(): Observable<{ transactions: TransactionModel[]; leaderboardValues: LeaderboardModel[] }> {
    if (!this.webSocket$ || this.webSocket$.closed) {
      this.webSocket$ = webSocket(`${environment.transactionWebsocketUrl}/transactions`);
    }

    this.isConnected.set(true);

    return this.webSocket$.pipe(
      bufferTime(500),
      filter(transactions => transactions.length > 0),
      tap({
        next: () => {
          this.isConnected.set(true);
          this.transactionError.set(null);
        },
        error: (error) => {
          this.transactionError.set(error);
          this.isConnected.set(false);
        },
      }),
      retry({
        count: MAX_RETRIES,
        delay: (error, retryCount) => {
          const delay = Math.min(
            INITIAL_DELAY * Math.pow(2, retryCount),
            MAX_DELAY
          );
          return timer(delay);
        },
        resetOnSuccess: true,
      }),
      map(newTransactions => {
        return {
          transactions: this.calculateTransactions(newTransactions),
          leaderboardValues: this.calculateLeaderboardValues(newTransactions),
        };
      }),
      tap({
        finalize: () => {
          this.isConnected.set(false);
        },
      })
    );
  }

  public resetData() {
    this.transactions = [];
    this.leaderboardValues = [];
  }

  private calculateTransactions(newTransactions: TransactionModel[]): TransactionModel[] {
    this.transactions.unshift(...(newTransactions.reverse()));

    if (this.transactions.length > MAX_TRANSACTION_SIZE) {
      this.transactions.length = MAX_TRANSACTION_SIZE;
    }
    return this.transactions;
  }

  private calculateLeaderboardValues(transactions: TransactionModel[]): LeaderboardModel[] {
    const leaderboardValueMap = new Map<string, LeaderboardModel>();

    this.leaderboardValues.forEach(value => {
      leaderboardValueMap.set(value.planetId, { ...value });
    });

    transactions.forEach(transaction => {
      const existingValue = leaderboardValueMap.get(transaction.planetId);

      if (existingValue) {
        existingValue.sumTransactionValue += transaction.volume;
        existingValue.numberOfTransactions += 1;
      } else {
        leaderboardValueMap.set(transaction.planetId, {
          planetId: transaction.planetId,
          sumTransactionValue: transaction.volume,
          numberOfTransactions: 1,
        });
      }
    });

    const newLeaderboardValues = Array.from(leaderboardValueMap.values())
      .sort((value1, value2) => value2.sumTransactionValue - value1.sumTransactionValue);

    this.leaderboardValues = newLeaderboardValues;
    return newLeaderboardValues;
  }
}
