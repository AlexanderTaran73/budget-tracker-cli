import { IAccount, IAccountManager, ISummary, ITransaction, TransactionType } from './types';

const typeLabels: Record<TransactionType, string> = {
  income: 'доход',
  expense: 'расход',
};

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₽`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function drawTable(title: string, headers: string[], rows: string[][], footer: string[] = []): string {
  const widths = headers.map((header, i) => Math.max(header.length, ...rows.map((row) => row[i].length)));

  // если заголовок или итоги длиннее колонок — расширяем последнюю колонку
  const columnsWidth = widths.reduce((sum, w) => sum + w + 3, -1);
  const longestText = Math.max(title.length, ...footer.map((line) => line.length)) + 2;
  if (longestText > columnsWidth) {
    widths[widths.length - 1] += longestText - columnsWidth;
  }
  const innerWidth = Math.max(columnsWidth, longestText);

  const border = (left: string, fill: string, cross: string, right: string): string =>
    left + widths.map((w) => fill.repeat(w + 2)).join(cross) + right;
  const row = (cells: string[]): string => '║' + cells.map((cell, i) => ` ${cell.padEnd(widths[i])} `).join('│') + '║';
  const wideRow = (text: string): string => `║ ${text.padEnd(innerWidth - 2)} ║`;

  const lines: string[] = [
    '╔' + '═'.repeat(innerWidth) + '╗',
    wideRow(title),
    border('╠', '═', '╤', '╣'),
    row(headers),
    border('╟', '─', '┼', '╢'),
    ...rows.map(row),
  ];

  if (footer.length > 0) {
    lines.push(border('╟', '─', '┴', '╢'), ...footer.map(wideRow), '╚' + '═'.repeat(innerWidth) + '╝');
  } else {
    lines.push(border('╚', '═', '╧', '╝'));
  }

  return lines.join('\n');
}

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
    return typeLabels[this.type];
  }

  toString(): string {
    return `#${this.id} ${this.description} (${this.typeLabel} ${this.formattedAmount}) | ${this.formattedDate}`;
  }
}

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

export class AccountManager implements IAccountManager, ISummary {
  private accounts: Account[] = [];

  get income(): number {
    return this.accounts.reduce((sum, account) => sum + account.income, 0);
  }

  get expenses(): number {
    return this.accounts.reduce((sum, account) => sum + account.expenses, 0);
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  addAccount(account: Account): void {
    if (this.getAccountById(account.id)) {
      throw new Error(`Счёт с id ${account.id} уже существует`);
    }
    this.accounts.push(account);
  }

  removeAccountById(accountId: number): boolean {
    const index = this.accounts.findIndex((account) => account.id === accountId);
    if (index === -1) {
      return false;
    }
    this.accounts.splice(index, 1);
    return true;
  }

  getAccountById(id: number): Account | undefined {
    return this.accounts.find((account) => account.id === id);
  }

  getAllAccounts(): Account[] {
    return [...this.accounts];
  }

  getAccounts(): Account[] {
    return this.getAllAccounts();
  }

  // без id — сводка по всем счетам, с id — по конкретному
  getSummary(accountId?: number): ISummary {
    if (accountId === undefined) {
      return {
        income: this.income,
        expenses: this.expenses,
        balance: this.balance,
      };
    }

    const account = this.getAccountById(accountId);
    if (!account) {
      throw new Error(`Счёт с id ${accountId} не найден`);
    }
    return account.getSummary();
  }

  getSummaryString(): string {
    const lines = this.accounts.map((account) => account.getSummaryString());
    lines.push(`Всего счетов: ${this.accounts.length}, общий баланс: ${formatMoney(this.balance)}`);
    return lines.join('\n');
  }

  toString(): string {
    const rows = this.accounts.map((account) => [
      String(account.id),
      account.name,
      String(account.getTransactions().length),
      formatMoney(account.income),
      formatMoney(account.expenses),
      formatMoney(account.balance),
    ]);
    const footer = [
      rows.length === 0 ? 'Счетов пока нет' : `Счетов: ${rows.length}`,
      `Доходы: ${formatMoney(this.income)}   Расходы: ${formatMoney(this.expenses)}   Баланс: ${formatMoney(this.balance)}`,
    ];

    return drawTable('Все счета', ['id', 'название', 'транзакций', 'доходы', 'расходы', 'баланс'], rows, footer);
  }
}
