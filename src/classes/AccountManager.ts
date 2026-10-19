/// <reference path="../interfaces/IAccountManager.ts" />
/// <reference path="Account.ts" />

namespace BudgetTracker {
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
}
