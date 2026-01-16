import {TransactionModel} from '@core/transaction/models/transaction.model';
import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, EMPTY, pipe, switchMap, tap} from 'rxjs';
import {inject} from '@angular/core';
import {TransactionService} from '@core/transaction/services/transaction.service';

const MAX_TRANSACTION_SIZE = 10000;

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
                    let transactions = [...state.transactions, ...newTransactions];

                    const overflow = transactions.length - MAX_TRANSACTION_SIZE;
                    if (overflow > 0) {
                      transactions.splice(0, overflow);
                    }

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
              catchError(() => EMPTY)
            )
          )
        )
      ),
      stopWatching: () => {
        transactionService.disconnect();
        patchState(store, { connected: false });
      },
    };
  }),
)
