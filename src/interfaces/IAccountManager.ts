/// <reference path="ISummary.ts" />
/// <reference path="../classes/Account.ts" />

namespace BudgetTracker {
  export interface IAccountManager {
    addAccount(account: Account): void;
    removeAccountById(accountId: number): boolean;
    getAccounts(): Account[];
    getAccountById(id: number): Account | undefined;
    getSummary(accountId: number): ISummary;
  }
}
