import {ProductType} from '@core/transaction/models/product.model';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface TransactionModel {
  id: string;
  product: ProductType;
  transactionType: TransactionType;
  timeStamp: string;
  volume: number;
  pricePerUnit: number;
  planetId: string;
}
