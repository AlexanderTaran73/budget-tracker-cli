import type { Account } from '../classes/Account';
import { ISummary } from './ISummary';

export interface IAccountManager {
  addAccount(account: Account): void;
  removeAccountById(accountId: string): boolean;
  getAccounts(): Account[];
  getAccountById(id: string): Account | undefined;
  getSummary(accountId: string): ISummary;
}
