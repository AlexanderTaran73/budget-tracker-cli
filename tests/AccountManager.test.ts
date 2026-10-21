import { describe, expect, it } from 'vitest';
import { Account } from '../src/classes/Account';
import { AccountManager } from '../src/classes/AccountManager';
import { Transaction } from '../src/classes/Transaction';

function createManager(): { manager: AccountManager; personal: Account; vacation: Account } {
  const personal = new Account('Личный бюджет');
  personal.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
  personal.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));

  const vacation = new Account('Отпуск');
  vacation.addTransaction(new Transaction(500, 'income', '2023-04-01T00:00:00Z', 'Премия'));

  const manager = new AccountManager();
  manager.addAccount(personal);
  manager.addAccount(vacation);
  return { manager, personal, vacation };
}

describe('AccountManager', () => {
  it('считает общую сводку и сводку по счёту', () => {
    const { manager, vacation } = createManager();
    expect(manager.getSummary()).toEqual({ income: 1500, expenses: 200, balance: 1300 });
    expect(manager.getSummary(vacation.id)).toEqual({ income: 500, expenses: 0, balance: 500 });
    expect(() => manager.getSummary('unknown')).toThrow();
  });

  it('находит и удаляет счета', () => {
    const { manager, personal } = createManager();
    expect(manager.getAccountById(personal.id)).toBe(personal);

    expect(manager.removeAccountById(personal.id)).toBe(true);
    expect(manager.removeAccountById(personal.id)).toBe(false);
    expect(manager.getAccountById(personal.id)).toBeUndefined();
    expect(manager.getAllAccounts()).toHaveLength(1);
    expect(manager.balance).toBe(500);
  });

  it('не добавляет один и тот же счёт дважды', () => {
    const { manager, personal } = createManager();
    expect(() => manager.addAccount(personal)).toThrow();
  });

  it('восстанавливает состояние из JSON целиком или не меняет его при ошибке', () => {
    const { manager } = createManager();
    const data = manager.toJSON();

    const restored = new AccountManager();
    restored.restore(data);
    expect(restored.getSummary()).toEqual(manager.getSummary());

    const broken = structuredClone(data);
    broken[1].transactions[0].amount = -5;
    expect(() => restored.restore(broken)).toThrow();
    expect(restored.getAllAccounts()).toHaveLength(2);
  });
});
