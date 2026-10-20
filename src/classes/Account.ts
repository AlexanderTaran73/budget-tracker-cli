import { formatCurrency } from 'budget-utils';
import { v4 as uuidv4 } from 'uuid';
import { IAccount } from '../interfaces/IAccount';
import { ISummary } from '../interfaces/ISummary';
import { TransactionType } from '../interfaces/TransactionType';
import { drawTable, shortId } from '../utils/format';
import { Transaction } from './Transaction';

export class Account implements IAccount, ISummary {
  readonly id: string;
  private transactions: Transaction[] = [];

  constructor(public readonly name: string) {
    this.id = uuidv4();
  }

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
    this.transactions.push(transaction);
  }

  removeTransactionById(transactionId: string): boolean {
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
    return `${this.name}: баланс ${formatCurrency(this.balance)}, транзакций: ${this.transactions.length}`;
  }

  toString(): string {
    const rows = this.transactions.map((t) => [
      shortId(t.id),
      t.description,
      t.typeLabel,
      t.formattedAmount,
      t.formattedDate,
    ]);
    const footer = [
      rows.length === 0 ? 'Транзакций пока нет' : `Транзакций: ${rows.length}`,
      `Доходы: ${formatCurrency(this.income)}   Расходы: ${formatCurrency(this.expenses)}   Баланс: ${formatCurrency(this.balance)}`,
    ];

    return drawTable(this.name, ['id', 'описание', 'тип', 'сумма', 'дата'], rows, footer);
  }

  private sumByType(type: TransactionType): number {
    return this.transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
  }
}
