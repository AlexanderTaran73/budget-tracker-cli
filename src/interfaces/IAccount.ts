import { Identifiable } from './Identifiable';
import { ITransaction } from './ITransaction';

export interface IAccount extends Identifiable {
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(transactionId: string): boolean;
  getTransactions(): ITransaction[];
  exportTransactionsToCSV(filename: string): Promise<void>;
}
