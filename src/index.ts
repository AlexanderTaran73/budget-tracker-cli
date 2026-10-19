import { Account, AccountManager, Transaction } from './classes';

console.log('🚀 Budget Tracker CLI\n');

const personalAccount = new Account(1, 'Личный бюджет');
personalAccount.addTransaction(new Transaction(1, 1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
personalAccount.addTransaction(new Transaction(2, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
personalAccount.addTransaction(new Transaction(3, 150, 'expense', '2023-01-10T00:00:00Z', 'Коммунальные услуги'));

const vacationAccount = new Account(2, 'Копилка на отпуск');
vacationAccount.addTransaction(new Transaction(1, 500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
vacationAccount.addTransaction(new Transaction(2, 600, 'income', '2023-04-03T00:00:00Z', 'Возврат долга'));
vacationAccount.addTransaction(new Transaction(3, 300, 'expense', '2023-04-05T00:00:00Z', 'Билеты на самолёт'));

const manager = new AccountManager();
manager.addAccount(personalAccount);
manager.addAccount(vacationAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));

console.log('\nСводка по личному бюджету:', personalAccount.getSummary());
console.log(personalAccount.getSummaryString());

console.log('\n' + String(manager));
console.log(manager.getSummaryString());
console.log('\nСводка по всем счетам:', manager.getSummary());
console.log('Сводка по счёту #2:', manager.getSummary(2));
console.log('Количество счетов:', manager.getAllAccounts().length);

console.log('\nПоиск счёта #2:', manager.getAccountById(2)?.getSummaryString());
console.log('Поиск счёта #99:', manager.getAccountById(99));

console.log('\nУдаление транзакции #3 из личного бюджета:', personalAccount.removeTransactionById(3));
console.log('Удаление несуществующей транзакции #42:', personalAccount.removeTransactionById(42));
console.log(personalAccount.getSummaryString());

console.log('\nУдаление счёта #2:', manager.removeAccountById(2));
console.log('Повторное удаление счёта #2:', manager.removeAccountById(2));
console.log(manager.getSummaryString());

try {
  personalAccount.addTransaction(new Transaction(4, -100, 'expense', '2023-01-12T00:00:00Z', 'Ошибочная транзакция'));
} catch (error) {
  console.log('\nОшибка:', error instanceof Error ? error.message : error);
}
