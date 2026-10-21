import { Identifiable } from './Identifiable';
import { TransactionType } from './TransactionType';

export interface ITransaction extends Identifiable {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
}
