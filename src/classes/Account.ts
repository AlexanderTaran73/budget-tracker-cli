import { formatCurrency } from 'budget-utils';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { LogClass } from '../decorators/LogClass';
import { LogMethod } from '../decorators/LogMethod';
import { Metadata, readMetadata } from '../decorators/Metadata';
import { ReadOnly } from '../decorators/ReadOnly';
import { IAccount } from '../interfaces/IAccount';
import { ISummary } from '../interfaces/ISummary';
import { TransactionType } from '../interfaces/TransactionType';
import { AccountUpdate, StoredAccount } from '../interfaces/utility-types';
import { escapeCsvValue } from '../utils/escapeCsvValue';
import { drawTable, shortId } from '../utils/format';
import { GenericStorage } from './GenericStorage';
import { Transaction } from './Transaction';

const CSV_HEADER = 'id,amount,type,date,description';

@LogClass
export class Account implements IAccount, ISummary {
  @ReadOnly
  id: string;

  name: string;

  @Metadata('description', 'Транзакции счёта')
  private transactions = new GenericStorage<Transaction>();

  constructor(name: string, id: string = uuidv4()) {
    this.id = id;
    this.name = Account.checkName(name);
  }

  static fromJSON(data: StoredAccount): Account {
    const account = new Account(data.name, data.id);
    for (const t of data.transactions) {
      account.addTransaction(new Transaction(t.amount, t.type, t.date, t.description, t.id));
    }
    return account;
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

  get transactionCount(): number {
    return this.transactions.size;
  }

  @LogMethod
  addTransaction(transaction: Transaction): void {
    this.transactions.add(transaction);
  }

  @LogMethod
  removeTransactionById(transactionId: string): boolean {
    return this.transactions.removeById(transactionId);
  }

  @LogMethod
  getTransactions(): Transaction[] {
    // сортируем по дате, чтобы в таблице и в CSV порядок был хронологический
    return this.transactions.getAll().sort((a, b) => a.date.localeCompare(b.date));
  }

  update(update: AccountUpdate): void {
    if (update.name !== undefined) {
      this.name = Account.checkName(update.name);
    }
  }

  getSummary(): ISummary {
    return {
      income: this.income,
      expenses: this.expenses,
      balance: this.balance,
    };
  }

  getSummaryString(): string {
    const description = readMetadata('description', this, 'transactions');
    const label = typeof description === 'string' ? description : 'Транзакций';
    return `${this.name}: баланс ${formatCurrency(this.balance)}, ${label.toLowerCase()}: ${this.transactionCount}`;
  }

  async exportTransactionsToCSV(filename: string): Promise<void> {
    const rows = this.getTransactions().map((t) =>
      [t.id, t.amount, t.type, t.date, t.description].map(escapeCsvValue).join(','),
    );
    // BOM нужен, чтобы Excel правильно открыл кириллицу
    const content = '﻿' + [CSV_HEADER, ...rows].join('\r\n') + '\r\n';

    try {
      await mkdir(path.dirname(filename), { recursive: true });
      await writeFile(filename, content, 'utf-8');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Не удалось записать файл ${filename}: ${reason}`);
    }
  }

  toString(): string {
    const rows = this.getTransactions().map((t) => [
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

  toJSON(): StoredAccount {
    return {
      id: this.id,
      name: this.name,
      transactions: this.getTransactions().map((t) => t.toJSON()),
    };
  }

  private sumByType(type: TransactionType): number {
    return this.transactions
      .getAll()
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private static checkName(name: string): string {
    const trimmed = name.trim();
    if (trimmed === '') {
      throw new Error('Название счёта не может быть пустым');
    }
    return trimmed;
  }
}
