// Демонстрация тем 9–12 (утилитные и mapped-типы, CSV, декораторы) без интерактивного меню: npm run demo
import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';
import { setDecoratorLogging } from './decorators/debug';
import { ITransaction } from './interfaces/ITransaction';
import {
  IsIncome,
  OptionalTransaction,
  ReadonlyTransactionFields,
  TransactionFieldType,
} from './interfaces/mapped-types';
import {
  AccountInfo,
  CategoryLimits,
  NullableDescription,
  TransactionConstructorParams,
  TransactionInstance,
  TransactionPreview,
  TransactionWithoutDescription,
} from './interfaces/utility-types';

setDecoratorLogging(true);

console.log('--- Декораторы ---');
const personalAccount = new Account('Личный бюджет');
const transaction: Transaction = new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата');
transaction.update({ amount: 1200 });
personalAccount.addTransaction(transaction);
personalAccount.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
personalAccount.addTransaction(new Transaction(150, 'expense', '2023-01-09T00:00:00Z', 'Коммунальные услуги'));
personalAccount.update({ name: 'Основной счёт' });

try {
  personalAccount.id = 'new-id';
} catch (error) {
  console.log('Попытка изменить id:', error instanceof Error ? error.message : error);
}

console.log('getSummaryString (описание из метаданных):', personalAccount.getSummaryString());
personalAccount.getTransactions();

setDecoratorLogging(false);

const manager = new AccountManager();
manager.addAccount(personalAccount);
console.log('\n' + String(personalAccount));

console.log('\n--- Утилитные типы ---');
const limits: CategoryLimits = { income: 10000, expense: 5000 };
console.log('Лимит пополнений:', limits.income);
console.log('Лимит трат:', limits.expense);

const transactionParams: TransactionConstructorParams = [500, 'expense', '2023-02-01T00:00:00Z', 'Покупка'];
const newTransaction: TransactionInstance = new Transaction(...transactionParams);
console.log(newTransaction.toString());

const preview: TransactionPreview = {
  id: newTransaction.id,
  amount: newTransaction.amount,
  type: newTransaction.type,
  date: newTransaction.date,
};
const info: AccountInfo = { id: personalAccount.id, name: personalAccount.name };
const withoutDescription: TransactionWithoutDescription = preview;
const nullable: NullableDescription = { ...preview, description: null };
console.log({ preview, info, withoutDescription, nullable });

console.log('\n--- Mapped / conditional types ---');
const amount: TransactionFieldType<'amount'> = 300; // number
const draft: OptionalTransaction<'description' | 'date'> = { id: 'draft', amount, type: 'expense' };
const fixed: ReadonlyTransactionFields<'id' | 'type'> = { ...draft, date: '2023-03-01T00:00:00Z', description: 'Такси' };
// fixed.type = 'income'; — ошибка компиляции: поле только для чтения
const isIncome: IsIncome<{ type: 'income'; amount: number }> = true;
const isNotIncome: IsIncome<ITransaction> = false; // type может быть и income, и expense
console.log({ draft, fixed, isIncome, isNotIncome });

console.log('\n--- Экспорт в CSV ---');
const csvPath = path.join(fileURLToPath(new URL('..', import.meta.url)), 'exports', 'main_account.csv');
try {
  await personalAccount.exportTransactionsToCSV(csvPath);
  console.log('Файл записан:', csvPath);
} catch (error) {
  console.log('В процессе записи произошла ошибка', (error as Error).message);
}
