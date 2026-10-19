import type { Account } from './classes';

export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  readonly id: number;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
}

export interface IAccount {
  readonly id: number;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(transactionId: number): boolean;
  getTransactions(): ITransaction[];
}

export interface ISummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface IAccountManager {
  addAccount(account: Account): void;
  removeAccountById(accountId: number): boolean;
  getAccounts(): Account[];
  getAccountById(id: number): Account | undefined;
  getSummary(accountId: number): ISummary;
}
