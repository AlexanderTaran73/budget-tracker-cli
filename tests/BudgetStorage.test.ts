import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Account } from '../src/classes/Account';
import { BudgetStorage } from '../src/classes/BudgetStorage';
import { Transaction } from '../src/classes/Transaction';

describe('BudgetStorage', () => {
  let dir: string;
  let storage: BudgetStorage;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'budget-storage-'));
    storage = new BudgetStorage(path.join(dir, 'data', 'budget.json'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('возвращает null, если файла ещё нет', async () => {
    expect(await storage.load()).toBeNull();
  });

  it('сохраняет и загружает счета', async () => {
    const account = new Account('Личный бюджет');
    account.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));

    await storage.save([account.toJSON()]);
    expect(await storage.load()).toEqual([account.toJSON()]);
  });

  it('сообщает о повреждённом файле и умеет сохранить его копию', async () => {
    await storage.save([]);
    await writeFile(storage.filePath, '{ not json', 'utf-8');
    await expect(storage.load()).rejects.toThrow('некорректный JSON');

    await writeFile(storage.filePath, JSON.stringify({ accounts: [{ id: 1 }] }), 'utf-8');
    await expect(storage.load()).rejects.toThrow('неожиданная структура');

    await storage.backupBrokenFile();
    const files = await readdir(path.dirname(storage.filePath));
    expect(files.some((name) => name.startsWith('budget.broken-'))).toBe(true);
    expect(await storage.load()).toBeNull();
  });
});
