import {TransactionModel} from '@core/transaction/models/transaction.model';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, retry, switchMap, tap, timer} from 'rxjs';
import {inject} from '@angular/core';
import {TransactionService} from '@core/transaction/services/transaction.service';
import {groupBy} from 'lodash-es';
import {LeaderboardModel} from '@core/transaction/models/leaderboard.model';

const MAX_TRANSACTION_SIZE = 10000;
const MAX_RETRIES = 10;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

interface TransactionState {
  transactions: TransactionModel[];
  error: string | null;
  connected: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  error: null,
  connected: false,
};

export const TransactionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    leaderboardValues: () => {
      const groupedPlanets = groupBy(store.transactions(), ({planetId}) => planetId);
      const leaderBoardValues: LeaderboardModel[] = Object.entries(groupedPlanets).map(([key, value]) => ({
        planetId: key,
        sumTransactionValue: value.reduce((accumulator, currentValue) => accumulator + currentValue.volume, 0),
        numberOfTransactions: value.length,
      })).sort((value1, value2) => value2.sumTransactionValue - value1.sumTransactionValue);
      return leaderBoardValues;
    },
  })),
  withMethods((store) => {
    const transactionService = inject(TransactionService);

    return {
      startWatching: rxMethod<void>(
        pipe(
          tap(() => patchState(store, {connected: true, error: null})),
          switchMap(() =>
            transactionService.connect().pipe(
              tap({
                next: (newTransactions) => {
                  patchState(store, (state) => {
                    let transactions = [...(newTransactions.reverse()), ...state.transactions];
                    transactions.splice(MAX_TRANSACTION_SIZE);

                    return {
                      ...state,
                      transactions,
                    };
                  })
                },
                error: (error) => {
                  patchState(store, { error, connected: false });
                },
                finalize: () => {
                  patchState(store, {connected: false});
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
              catchError(() => EMPTY)
            )
          )
        )
      ),
      stopWatching: () => {
        transactionService.disconnect();
        patchState(store, { connected: false });
      },
      reset: () => {
        transactionService.disconnect();
        patchState(store, initialState);
      },
    };
  }),
)
