import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Account } from './classes/Account';
import { ApplicationController } from './classes/ApplicationController';
import { BudgetStorage } from './classes/BudgetStorage';
import { Transaction } from './classes/Transaction';
import { setDecoratorLogging } from './decorators/debug';

const args = process.argv.slice(2);
const projectRoot = fileURLToPath(new URL('..', import.meta.url));

function setInitialState(controller: ApplicationController): void {
  const personalAccount = new Account('Личный бюджет');
  personalAccount.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
  personalAccount.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
  personalAccount.addTransaction(new Transaction(150, 'expense', '2023-01-09T00:00:00Z', 'Коммунальные услуги'));
  controller.accountManager.addAccount(personalAccount);

  const vacationAccount = new Account('Копилка на отпуск');
  vacationAccount.addTransaction(new Transaction(500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
  vacationAccount.addTransaction(new Transaction(600, 'income', '2023-01-01T00:00:00Z', 'Возврат долга'));
  vacationAccount.addTransaction(new Transaction(300, 'expense', '2023-01-05T00:00:00Z', 'Билеты на самолёт'));
  vacationAccount.addTransaction(new Transaction(200, 'expense', '2023-01-09T00:00:00Z', 'Номер в отеле'));
  controller.accountManager.addAccount(vacationAccount);
}

async function main(): Promise<void> {
  setDecoratorLogging(args.includes('--debug'));

  const storage = new BudgetStorage(path.join(projectRoot, 'data', 'budget.json'));
  const controller = new ApplicationController(storage, path.join(projectRoot, 'exports'));

  const restored = !args.includes('--reset') && (await controller.restore());
  if (!restored) {
    setInitialState(controller);
    await controller.save();
  }

  await controller.start();
}

main().catch((error: unknown) => {
  // Ctrl+C во время вопроса inquirer — штатный выход, а не ошибка
  if (error instanceof Error && error.name === 'ExitPromptError') {
    console.log('\nДо встречи! 👋');
    return;
  }
  console.error('Непредвиденная ошибка:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
