import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {TransactionModel} from '@core/transaction/models/transaction.model';
import {bufferTime, Observable} from 'rxjs';
import {webSocket} from 'rxjs/webSocket';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private webSocket$: WebSocketSubject<TransactionModel> | null = null;

  public connect(): Observable<TransactionModel[]> {
    if (!this.webSocket$ || this.webSocket$.closed) {
      this.webSocket$ = webSocket(`${environment.transactionWebsocketUrl}/transactions`);
    }

    return this.webSocket$.pipe(
      bufferTime(200),
    )
  }

  public disconnect() {
    this.webSocket$?.complete();
    this.webSocket$ = null;
  }
}
