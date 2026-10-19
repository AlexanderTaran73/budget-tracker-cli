/// <reference path="../interfaces/ITransaction.ts" />
/// <reference path="../utils/format.ts" />

namespace BudgetTracker {
  export class Transaction implements ITransaction {
    constructor(
      public readonly id: number,
      public readonly amount: number,
      public readonly type: TransactionType,
      public readonly date: string,
      public readonly description: string,
    ) {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Сумма транзакции должна быть больше нуля, получено: ${amount}`);
      }
      if (Number.isNaN(Date.parse(date))) {
        throw new Error(`Некорректная дата транзакции: ${date}`);
      }
    }

    get formattedAmount(): string {
      return formatMoney(this.amount);
    }

    get formattedDate(): string {
      return formatDate(this.date);
    }

    get typeLabel(): string {
      return transactionTypeLabels[this.type];
    }

    toString(): string {
      return `#${this.id} ${this.description} (${this.typeLabel} ${this.formattedAmount}) | ${this.formattedDate}`;
    }
  }
}
