import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TransactionStore} from './transaction.store';
import {TransactionService} from '@core/transaction/services/transaction.service';
import {TransactionModel, TransactionType} from '@core/transaction/models/transaction.model';
import {ProductType} from '@core/transaction/models/product.model';
import {Subject} from 'rxjs';

describe('TransactionStore', () => {
  let store: InstanceType<typeof TransactionStore>;
  let mockTransactionService: any;
  let transactionSubject: Subject<TransactionModel[]>;

  beforeEach(() => {
    transactionSubject = new Subject<TransactionModel[]>();

    mockTransactionService = {
      connect: vi.fn().mockReturnValue(transactionSubject.asObservable()),
      disconnect: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TransactionService, useValue: mockTransactionService }
      ]
    });

    store = TestBed.inject(TransactionStore);
  });

  describe('Initial State', () => {
    it('should have empty transactions', () => {
      expect(store.transactions()).toEqual([]);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should not be connected', () => {
      expect(store.connected()).toBe(false);
    });

    it('should have empty leaderboard', () => {
      expect(store.leaderboardValues()).toEqual([]);
    });
  });

  describe('startWatching', () => {
    it('should set connected to true immediately', () => {
      store.startWatching();

      expect(store.connected()).toBe(true);
      expect(store.error()).toBeNull();
    });

    it('should call transactionService.connect', () => {
      store.startWatching();

      expect(mockTransactionService.connect).toHaveBeenCalled();
    });

    it('should add new transactions to state', () => {
      const newTransactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(newTransactions);

      expect(store.transactions().length).toBe(1);
      expect(store.transactions()[0].id).toBe('tx1');
    });

    it('should prepend new transactions in reverse order', () => {
      const batch1: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 1,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        },
        {
          id: 'tx2',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 1,
          pricePerUnit: 1,
          transactionType: TransactionType.SELL,
          timeStamp: '2026-01-18T20:00:01Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(batch1);

      // Should be reversed: tx2, tx1
      expect(store.transactions()[0].id).toBe('tx2');
      expect(store.transactions()[1].id).toBe('tx1');
    });

    it('should accumulate transactions across multiple emissions', () => {
      const batch1: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        }
      ];

      const batch2: TransactionModel[] = [
        {
          id: 'tx2',
          planetId: 'p2',
          product: ProductType.ENERGY,
          volume: 20,
          pricePerUnit: 3,
          transactionType: TransactionType.SELL,
          timeStamp: '2026-01-18T20:00:01Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(batch1);
      transactionSubject.next(batch2);

      expect(store.transactions().length).toBe(2);
      expect(store.transactions()[0].id).toBe('tx2'); // Most recent first
      expect(store.transactions()[1].id).toBe('tx1');
    });

    it('should limit transactions to MAX_TRANSACTION_SIZE (10000)', () => {
      const largeTransactionSet: TransactionModel[] = new Array(100).fill(null).map((_, i) => ({
        id: `tx${i}`,
        planetId: 'p1',
        product: ProductType.ENERGY,
        volume: 1,
        pricePerUnit: 1,
        transactionType: TransactionType.BUY,
        timeStamp: '2026-01-18T20:00:00Z'
      }));

      store.startWatching();

      // Emit 100 transactions multiple times
      for (let i = 0; i < 110; i++) {
        transactionSubject.next(largeTransactionSet);
      }

      expect(store.transactions().length).toBeLessThanOrEqual(10000);
    });

    it('should set error state on stream error', () => {
      const errorSubject = new Subject<TransactionModel[]>();
      mockTransactionService.connect.mockReturnValue(errorSubject.asObservable());

      store.startWatching();

      const testError = new Error('WebSocket error');
      errorSubject.error(testError);

      expect(store.error()).toBeTruthy();
      expect(store.connected()).toBe(false);
    });

    it('should handle empty transaction batches', () => {
      store.startWatching();
      transactionSubject.next([]);

      expect(store.transactions().length).toBe(0);
    });
  });

  describe('stopWatching', () => {
    it('should call transactionService.disconnect', () => {
      store.stopWatching();

      expect(mockTransactionService.disconnect).toHaveBeenCalled();
    });

    it('should set connected to false', () => {
      store.startWatching();
      expect(store.connected()).toBe(true);

      store.stopWatching();

      expect(store.connected()).toBe(false);
    });

    it('should not clear existing transactions', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      store.stopWatching();

      expect(store.transactions().length).toBe(1);
    });
  });

  describe('leaderboardValues computed', () => {
    it('should calculate leaderboard from transactions', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        },
        {
          id: 'tx2',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 5,
          pricePerUnit: 5,
          transactionType: TransactionType.SELL,
          timeStamp: '2026-01-18T20:00:01Z'
        },
        {
          id: 'tx3',
          planetId: 'p2',
          product: ProductType.ENERGY,
          volume: 20,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:02Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      const leaderboard = store.leaderboardValues();

      expect(leaderboard.length).toBe(2);
      expect(leaderboard[0].planetId).toBe('p2'); // Higher volume
      expect(leaderboard[0].sumTransactionValue).toBe(20);
      expect(leaderboard[0].numberOfTransactions).toBe(1);
      expect(leaderboard[1].planetId).toBe('p1');
      expect(leaderboard[1].sumTransactionValue).toBe(15); // 10 + 5
      expect(leaderboard[1].numberOfTransactions).toBe(2);
    });

    it('should sort leaderboard by sumTransactionValue descending', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 5,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        },
        {
          id: 'tx2',
          planetId: 'p2',
          product: ProductType.ENERGY,
          volume: 20,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:01Z'
        },
        {
          id: 'tx3',
          planetId: 'p3',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:02Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      const leaderboard = store.leaderboardValues();

      expect(leaderboard[0].sumTransactionValue).toBe(20);
      expect(leaderboard[1].sumTransactionValue).toBe(10);
      expect(leaderboard[2].sumTransactionValue).toBe(5);
    });

    it('should return empty array when no transactions', () => {
      expect(store.leaderboardValues()).toEqual([]);
    });

    it('should handle single planet with multiple transactions', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        },
        {
          id: 'tx2',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 15,
          pricePerUnit: 1,
          transactionType: TransactionType.SELL,
          timeStamp: '2026-01-18T20:00:01Z'
        },
        {
          id: 'tx3',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 5,
          pricePerUnit: 1,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:02Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      const leaderboard = store.leaderboardValues();

      expect(leaderboard.length).toBe(1);
      expect(leaderboard[0].planetId).toBe('p1');
      expect(leaderboard[0].sumTransactionValue).toBe(30);
      expect(leaderboard[0].numberOfTransactions).toBe(3);
    });
  });

  describe('Transaction Types', () => {
    it('should handle BUY transactions', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.BUY,
          timeStamp: '2026-01-18T20:00:00Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      expect(store.transactions()[0].transactionType).toBe(TransactionType.BUY);
    });

    it('should handle SELL transactions', () => {
      const transactions: TransactionModel[] = [
        {
          id: 'tx1',
          planetId: 'p1',
          product: ProductType.ENERGY,
          volume: 10,
          pricePerUnit: 5,
          transactionType: TransactionType.SELL,
          timeStamp: '2026-01-18T20:00:00Z'
        }
      ];

      store.startWatching();
      transactionSubject.next(transactions);

      expect(store.transactions()[0].transactionType).toBe(TransactionType.SELL);
    });
  });
});
