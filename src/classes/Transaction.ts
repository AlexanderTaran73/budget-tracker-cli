import { formatCurrency } from 'budget-utils';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';
import { formatDate, shortId, transactionTypeLabels } from '../utils/format';

export class Transaction implements ITransaction {
  readonly id: string;

  constructor(
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly description: string,
  ) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Сумма транзакции должна быть больше нуля, получено: ${amount}`);
    }
    if (!moment(date, moment.ISO_8601, true).isValid()) {
      throw new Error(`Некорректная дата транзакции: ${date}`);
    }
    this.id = uuidv4();
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

  toString(): string {
    return `#${shortId(this.id)} ${this.description} (${this.typeLabel} ${this.formattedAmount}) | ${this.formattedDate}`;
  }
}
