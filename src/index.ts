import { formatCurrency } from 'budget-utils';
import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';

console.log('🚀 Budget Tracker CLI\n');

const personalAccount = new Account('Личный бюджет');
personalAccount.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
personalAccount.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
personalAccount.addTransaction(new Transaction(150, 'expense', '2023-01-10T00:00:00Z', 'Коммунальные услуги'));

const vacationAccount = new Account('Копилка на отпуск');
vacationAccount.addTransaction(new Transaction(500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
vacationAccount.addTransaction(new Transaction(600.5, 'income', '2023-04-03T00:00:00Z', 'Возврат долга'));
vacationAccount.addTransaction(new Transaction(300, 'expense', '2023-04-05T00:00:00Z', 'Билеты на самолёт'));

const manager = new AccountManager();
manager.addAccount(personalAccount);
manager.addAccount(vacationAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${formatCurrency(manager.balance)}`);

console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));

console.log('\nid счёта целиком:', personalAccount.id);

console.log('\n' + String(manager));
console.log(manager.getSummaryString());
console.log('\nСводка по копилке:', manager.getSummary(vacationAccount.id));

const firstTransaction = personalAccount.getTransactions()[0];
console.log(`\nУдаление транзакции ${firstTransaction.id}:`, personalAccount.removeTransactionById(firstTransaction.id));
console.log('Удаление счёта "Копилка на отпуск":', manager.removeAccountById(vacationAccount.id));
console.log(manager.getSummaryString());

try {
  new Transaction(100, 'expense', '31.12.2023', 'Неверный формат даты');
} catch (error) {
  console.log('\nОшибка:', error instanceof Error ? error.message : error);
}
