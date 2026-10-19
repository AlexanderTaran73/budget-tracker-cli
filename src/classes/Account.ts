/// <reference path="../interfaces/IAccount.ts" />
/// <reference path="../interfaces/ISummary.ts" />
/// <reference path="Transaction.ts" />

namespace BudgetTracker {
  export class Account implements IAccount, ISummary {
    private transactions: Transaction[] = [];

    constructor(
      public readonly id: number,
      public readonly name: string,
    ) {}

    get income(): number {
      return this.sumByType('income');
    }

    get expenses(): number {
      return this.sumByType('expense');
    }

    get balance(): number {
      return this.income - this.expenses;
    }

    addTransaction(transaction: Transaction): void {
      if (this.transactions.some((t) => t.id === transaction.id)) {
        throw new Error(`В счёте "${this.name}" уже есть транзакция с id ${transaction.id}`);
      }
      this.transactions.push(transaction);
    }

    removeTransactionById(transactionId: number): boolean {
      const index = this.transactions.findIndex((t) => t.id === transactionId);
      if (index === -1) {
        return false;
      }
      this.transactions.splice(index, 1);
      return true;
    }

    getTransactions(): Transaction[] {
      return [...this.transactions];
    }

    getSummary(): ISummary {
      return {
        income: this.income,
        expenses: this.expenses,
        balance: this.balance,
      };
    }

    getSummaryString(): string {
      return `${this.name}: баланс ${formatMoney(this.balance)}, транзакций: ${this.transactions.length}`;
    }

    toString(): string {
      const rows = this.transactions.map((t) => [
        String(t.id),
        t.description,
        t.typeLabel,
        t.formattedAmount,
        t.formattedDate,
      ]);
      const footer = [
        rows.length === 0 ? 'Транзакций пока нет' : `Транзакций: ${rows.length}`,
        `Доходы: ${formatMoney(this.income)}   Расходы: ${formatMoney(this.expenses)}   Баланс: ${formatMoney(this.balance)}`,
      ];

      return drawTable(`#${this.id} ${this.name}`, ['id', 'описание', 'тип', 'сумма', 'дата'], rows, footer);
    }

    private sumByType(type: TransactionType): number {
      return this.transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
    }
  }
}
