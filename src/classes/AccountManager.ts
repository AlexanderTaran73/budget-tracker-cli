import { formatCurrency } from 'budget-utils';
import { IAccountManager } from '../interfaces/IAccountManager';
import { ISummary } from '../interfaces/ISummary';
import { StoredAccount } from '../interfaces/utility-types';
import { drawTable, shortId } from '../utils/format';
import { Account } from './Account';
import { GenericStorage } from './GenericStorage';

export class AccountManager implements IAccountManager, ISummary {
  private accounts = new GenericStorage<Account>();

  get income(): number {
    return this.accounts.getAll().reduce((sum, account) => sum + account.income, 0);
  }

  get expenses(): number {
    return this.accounts.getAll().reduce((sum, account) => sum + account.expenses, 0);
  }

  get balance(): number {
    return this.income - this.expenses;
  }

  addAccount(account: Account): void {
    this.accounts.add(account);
  }

  removeAccountById(accountId: string): boolean {
    return this.accounts.removeById(accountId);
  }

  getAccountById(id: string): Account | undefined {
    return this.accounts.getById(id);
  }

  getAllAccounts(): Account[] {
    return this.accounts.getAll();
  }

  getAccounts(): Account[] {
    return this.getAllAccounts();
  }

  getAccountNames(): string[] {
    return this.accounts.getAll().map((account) => account.name);
  }

  // без id — сводка по всем счетам, с id — по конкретному
  getSummary(accountId?: string): ISummary {
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
    const lines = this.accounts.getAll().map((account) => account.getSummaryString());
    lines.push(`Всего счетов: ${this.accounts.size}, общий баланс: ${formatCurrency(this.balance)}`);
    return lines.join('\n');
  }

  // сначала собираем все счета, чтобы при ошибке в данных не остаться с половиной загруженного
  restore(data: StoredAccount[]): void {
    const accounts = data.map((item) => Account.fromJSON(item));
    this.accounts.clear();
    accounts.forEach((account) => this.accounts.add(account));
  }

  toJSON(): StoredAccount[] {
    return this.accounts.getAll().map((account) => account.toJSON());
  }

  toString(): string {
    const rows = this.accounts.getAll().map((account) => [
      shortId(account.id),
      account.name,
      String(account.transactionCount),
      formatCurrency(account.income),
      formatCurrency(account.expenses),
      formatCurrency(account.balance),
    ]);
    const footer = [
      rows.length === 0 ? 'Счетов пока нет — создайте первый' : `Счетов: ${rows.length}`,
      `Доходы: ${formatCurrency(this.income)}   Расходы: ${formatCurrency(this.expenses)}   Баланс: ${formatCurrency(this.balance)}`,
    ];

    return drawTable('Все счета', ['id', 'название', 'транзакций', 'доходы', 'расходы', 'баланс'], rows, footer);
  }
}
