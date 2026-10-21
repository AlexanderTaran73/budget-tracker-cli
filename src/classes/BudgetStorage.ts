import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CompleteTransaction, StoredAccount } from '../interfaces/utility-types';

interface StoredData {
  version: number;
  accounts: StoredAccount[];
}

const DATA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStoredTransaction(value: unknown): value is CompleteTransaction {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.amount === 'number' &&
    (value.type === 'income' || value.type === 'expense') &&
    typeof value.date === 'string' &&
    typeof value.description === 'string'
  );
}

function isStoredAccount(value: unknown): value is StoredAccount {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isStoredTransaction)
  );
}

function isStoredData(value: unknown): value is StoredData {
  return isRecord(value) && Array.isArray(value.accounts) && value.accounts.every(isStoredAccount);
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export class BudgetStorage {
  constructor(readonly filePath: string) {}

  // null — файла ещё нет (первый запуск)
  async load(): Promise<StoredAccount[] | null> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, 'utf-8');
    } catch (error) {
      if (isFileNotFound(error)) {
        return null;
      }
      throw new Error(`Не удалось прочитать файл данных ${this.filePath}`);
    }

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Файл данных повреждён: некорректный JSON');
    }

    if (!isStoredData(data)) {
      throw new Error('Файл данных повреждён: неожиданная структура');
    }
    return data.accounts;
  }

  async save(accounts: StoredAccount[]): Promise<void> {
    const data: StoredData = { version: DATA_VERSION, accounts };
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async backupBrokenFile(): Promise<string> {
    const backupPath = this.filePath.replace(/\.json$/, '') + `.broken-${Date.now()}.json`;
    await rename(this.filePath, backupPath);
    return backupPath;
  }
}
