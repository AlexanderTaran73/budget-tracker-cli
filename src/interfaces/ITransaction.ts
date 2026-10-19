/// <reference path="TransactionType.ts" />

namespace BudgetTracker {
  export interface ITransaction {
    readonly id: number;
    amount: number;
    type: TransactionType;
    date: string;
    description: string;
  }
}
