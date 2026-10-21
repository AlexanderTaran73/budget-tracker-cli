import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Account } from '../src/classes/Account';
import { Transaction } from '../src/classes/Transaction';

function createAccount(): Account {
  const account = new Account('Личный бюджет');
  account.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
  account.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
  account.addTransaction(new Transaction(150, 'expense', '2023-01-09T00:00:00Z', 'Кафе, "Ромашка"'));
  return account;
}

describe('Account', () => {
  it('считает доходы, расходы и баланс', () => {
    const account = createAccount();
    expect(account.getSummary()).toEqual({ income: 1000, expenses: 350, balance: 650 });
  });

  it('удаляет транзакцию по id', () => {
    const account = createAccount();
    const [first] = account.getTransactions();

    expect(account.removeTransactionById(first.id)).toBe(true);
    expect(account.removeTransactionById(first.id)).toBe(false);
    expect(account.transactionCount).toBe(2);
    expect(account.balance).toBe(-350);
  });

  it('getTransactions возвращает копию', () => {
    const account = createAccount();
    account.getTransactions().pop();
    expect(account.transactionCount).toBe(3);
  });

  it('не даёт изменить id после создания', () => {
    const account = createAccount();
    expect(() => {
      account.id = 'other';
    }).toThrow('только для чтения');
  });

  it('переименовывается через update', () => {
    const account = createAccount();
    account.update({ name: '  Основной счёт ' });
    expect(account.name).toBe('Основной счёт');
    expect(() => account.update({ name: '' })).toThrow();
  });

  it('берёт описание транзакций из метаданных', () => {
    expect(createAccount().getSummaryString()).toBe('Личный бюджет: баланс 650 ₽, транзакции счёта: 3');
  });

  it('сериализуется и восстанавливается из JSON', () => {
    const account = createAccount();
    const restored = Account.fromJSON(account.toJSON());
    expect(restored.id).toBe(account.id);
    expect(restored.getSummary()).toEqual(account.getSummary());
  });

  describe('exportTransactionsToCSV', () => {
    let dir: string;

    beforeEach(async () => {
      dir = await mkdtemp(path.join(os.tmpdir(), 'budget-test-'));
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    it('пишет заголовок и экранированные строки', async () => {
      const account = createAccount();
      const file = path.join(dir, 'nested', 'account.csv');
      await account.exportTransactionsToCSV(file);

      const lines = (await readFile(file, 'utf-8')).replace('﻿', '').trim().split('\r\n');
      expect(lines[0]).toBe('id,amount,type,date,description');
      expect(lines).toHaveLength(4);
      expect(lines[3]).toMatch(/,150,expense,2023-01-09T00:00:00Z,"Кафе, ""Ромашка"""$/);
    });

    it('выбрасывает понятную ошибку, если файл записать нельзя', async () => {
      const account = createAccount();
      // в существующую папку как в файл записать нельзя
      await expect(account.exportTransactionsToCSV(dir)).rejects.toThrow('Не удалось записать файл');
    });
  });
});
