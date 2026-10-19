/// <reference path="classes/Transaction.ts" />
/// <reference path="classes/Account.ts" />
/// <reference path="classes/AccountManager.ts" />

console.log('🚀 Budget Tracker CLI\n');

const personalAccount = new BudgetTracker.Account(1, 'Личный бюджет');
personalAccount.addTransaction(new BudgetTracker.Transaction(1, 1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
personalAccount.addTransaction(new BudgetTracker.Transaction(2, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
personalAccount.addTransaction(
  new BudgetTracker.Transaction(3, 150, 'expense', '2023-01-10T00:00:00Z', 'Коммунальные услуги'),
);

const vacationAccount = new BudgetTracker.Account(2, 'Копилка на отпуск');
vacationAccount.addTransaction(new BudgetTracker.Transaction(1, 500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
vacationAccount.addTransaction(new BudgetTracker.Transaction(2, 600, 'income', '2023-04-03T00:00:00Z', 'Возврат долга'));
vacationAccount.addTransaction(
  new BudgetTracker.Transaction(3, 300, 'expense', '2023-04-05T00:00:00Z', 'Билеты на самолёт'),
);

const manager = new BudgetTracker.AccountManager();
manager.addAccount(personalAccount);
manager.addAccount(vacationAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));

console.log('\n' + String(manager));
console.log(manager.getSummaryString());
console.log('\nСводка по счёту #2:', manager.getSummary(2));

console.log('\nУдаление счёта #2:', manager.removeAccountById(2));
console.log(manager.getSummaryString());
