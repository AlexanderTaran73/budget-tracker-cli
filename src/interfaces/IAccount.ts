/// <reference path="ITransaction.ts" />

namespace BudgetTracker {
  export interface IAccount {
    readonly id: number;
    name: string;
    addTransaction(transaction: ITransaction): void;
    removeTransactionById(transactionId: number): boolean;
    getTransactions(): ITransaction[];
  }
}
