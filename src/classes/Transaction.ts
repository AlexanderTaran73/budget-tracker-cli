import { formatCurrency } from 'budget-utils';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';
import { CompleteTransaction, TransactionUpdate } from '../interfaces/utility-types';
import { formatDate, shortId, transactionTypeLabels } from '../utils/format';

export class Transaction implements ITransaction {
  readonly id: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;

  constructor(amount: number, type: TransactionType, date: string, description: string, id: string = uuidv4()) {
    Transaction.validate({ amount, type, date, description });
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description.trim();
  }

  get formattedAmount(): string {
    return formatCurrency(this.amount);
  }

  get formattedDate(): string {
    return formatDate(this.date);
  }

  get typeLabel(): string {
    return transactionTypeLabels[this.type];
  }

  update(update: TransactionUpdate): void {
    const next = { ...this.toJSON(), ...update };
    Transaction.validate(next);

    this.amount = next.amount;
    this.type = next.type;
    this.date = next.date;
    this.description = next.description.trim();
  }

  toString(): string {
    return `#${shortId(this.id)} ${this.description} (${this.typeLabel} ${this.formattedAmount}) | ${this.formattedDate}`;
  }

  toJSON(): CompleteTransaction {
    return {
      id: this.id,
      amount: this.amount,
      type: this.type,
      date: this.date,
      description: this.description,
    };
  }

  private static validate(data: Omit<ITransaction, 'id'>): void {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new Error(`Сумма транзакции должна быть больше нуля, получено: ${data.amount}`);
    }
    if (data.type !== 'income' && data.type !== 'expense') {
      throw new Error(`Неизвестный тип транзакции: ${data.type}`);
    }
    if (!moment(data.date, moment.ISO_8601, true).isValid()) {
      throw new Error(`Некорректная дата транзакции: ${data.date}`);
    }
    if (typeof data.description !== 'string' || data.description.trim() === '') {
      throw new Error('Описание транзакции не может быть пустым');
    }
  }
}
