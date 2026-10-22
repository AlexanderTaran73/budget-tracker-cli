import { formatCurrency } from 'budget-utils';
import inquirer from 'inquirer';
import moment from 'moment';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { isDecoratorLoggingEnabled } from '../decorators/debug';
import { TransactionType } from '../interfaces/TransactionType';
import { CategoryLimits, TransactionConstructorParams } from '../interfaces/utility-types';
import { transactionTypeLabels } from '../utils/format';
import {
  DATE_INPUT_FORMAT,
  normalizeFileName,
  parseAmount,
  toIsoDate,
  toSafeFileName,
  validateAccountName,
  validateAmount,
  validateDate,
  validateDescription,
  validateFileName,
} from '../utils/validators';
import { Account } from './Account';
import { AccountManager } from './AccountManager';
import { BudgetStorage } from './BudgetStorage';
import { Transaction } from './Transaction';

enum AccountAction {
  AddTransaction = 'add-transaction',
  RemoveTransaction = 'remove-transaction',
  Export = 'export',
  Rename = 'rename',
  RemoveAccount = 'remove-account',
  Back = 'back',
}

type MainMenuChoice = { kind: 'account'; accountId: string } | { kind: 'create' } | { kind: 'exit' };

const DEFAULT_LIMITS: CategoryLimits = {
  income: 500_000,
  expense: 100_000,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export class ApplicationController {
  readonly accountManager = new AccountManager();
  private notice: string | null = null;

  constructor(
    private readonly storage: BudgetStorage | null = null,
    private readonly exportDir: string = 'exports',
    private readonly limits: CategoryLimits = DEFAULT_LIMITS,
  ) {}

  async restore(): Promise<boolean> {
    if (!this.storage) {
      return false;
    }

    try {
      const data = await this.storage.load();
      if (data === null) {
        return false;
      }
      this.accountManager.restore(data);
      return true;
    } catch (error) {
      let backupInfo = '';
      try {
        backupInfo = ` Старый файл сохранён как ${await this.storage.backupBrokenFile()}.`;
      } catch {
        // если не удалось переименовать — просто работаем дальше
      }
      this.notice = `⚠️  ${errorMessage(error)}.${backupInfo} Загружены демонстрационные данные.`;
      return false;
    }
  }

  async save(): Promise<void> {
    if (!this.storage) {
      return;
    }
    try {
      await this.storage.save(this.accountManager.toJSON());
    } catch (error) {
      this.notice = `⚠️  Не удалось сохранить данные: ${errorMessage(error)}`;
    }
  }

  async start(): Promise<void> {
    while (true) {
      this.showScreen('Управление личными финансами');
      console.log(String(this.accountManager) + '\n');

      const choice = await this.selectMainMenuItem();
      if (choice.kind === 'exit') {
        break;
      }
      if (choice.kind === 'create') {
        await this.createAccount();
      } else {
        await this.watchAccount(choice.accountId);
      }
    }

    console.clear();
    console.log('До встречи! 👋');
  }

  async createAccount(): Promise<void> {
    this.showScreen('Новый счёт');

    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Название счёта:',
        validate: (input: string) => validateAccountName(input, this.accountManager.getAccountNames()),
      },
    ]);

    const account = new Account(name);
    this.accountManager.addAccount(account);
    await this.save();
    this.notice = `✅ Счёт «${account.name}» создан`;
  }

  async watchAccount(accountId: string): Promise<void> {
    while (true) {
      const account = this.accountManager.getAccountById(accountId);
      if (!account) {
        return;
      }

      this.showScreen(`Счёт «${account.name}»`);
      console.log(account.toString() + '\n');

      const { action } = await inquirer.prompt<{ action: AccountAction }>([
        {
          type: 'select',
          name: 'action',
          message: 'Что сделать?',
          choices: [
            { name: '➕ Добавить транзакцию', value: AccountAction.AddTransaction },
            { name: '➖ Удалить транзакцию', value: AccountAction.RemoveTransaction },
            { name: '💾 Экспортировать в CSV', value: AccountAction.Export },
            { name: '✏️  Переименовать счёт', value: AccountAction.Rename },
            { name: '🗑️  Удалить счёт', value: AccountAction.RemoveAccount },
            new inquirer.Separator(),
            { name: '↩  Назад к списку счетов', value: AccountAction.Back },
          ],
        },
      ]);

      switch (action) {
        case AccountAction.AddTransaction:
          await this.addTransaction(account);
          break;
        case AccountAction.RemoveTransaction:
          await this.removeTransaction(account);
          break;
        case AccountAction.Export:
          await this.exportTransactionsToCSV(account);
          break;
        case AccountAction.Rename:
          await this.renameAccount(account);
          break;
        case AccountAction.RemoveAccount:
          if (await this.removeAccount(account)) {
            return;
          }
          break;
        case AccountAction.Back:
          return;
      }
    }
  }

  async addTransaction(account: Account): Promise<void> {
    this.showScreen(`Новая транзакция — «${account.name}»`);

    const answers = await inquirer.prompt<{
      type: TransactionType;
      amount: string;
      date: string;
      description: string;
    }>([
      {
        type: 'select',
        name: 'type',
        message: 'Тип транзакции:',
        choices: [
          { name: 'Доход', value: 'income' },
          { name: 'Расход', value: 'expense' },
        ],
      },
      { type: 'input', name: 'amount', message: 'Сумма, ₽:', validate: validateAmount },
      {
        type: 'input',
        name: 'date',
        message: `Дата (${DATE_INPUT_FORMAT}):`,
        default: moment().format(DATE_INPUT_FORMAT),
        validate: validateDate,
      },
      { type: 'input', name: 'description', message: 'Описание:', validate: validateDescription },
    ]);

    const params: TransactionConstructorParams = [
      parseAmount(answers.amount),
      answers.type,
      toIsoDate(answers.date),
      answers.description,
    ];
    const [amount, type] = params;
    const limit = this.limits[type];

    const preview = `${transactionTypeLabels[type]} ${formatCurrency(amount)} — ${answers.description.trim()}`;
    const message =
      amount > limit
        ? `Сумма больше обычного лимита для операции «${transactionTypeLabels[type]}» (${formatCurrency(limit)}). Всё верно? ${preview}`
        : `Добавить: ${preview}?`;

    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
      { type: 'confirm', name: 'confirmed', message, default: amount <= limit },
    ]);
    if (!confirmed) {
      this.notice = 'Добавление отменено';
      return;
    }

    try {
      account.addTransaction(new Transaction(...params));
      await this.save();
      this.notice = '✅ Транзакция добавлена';
    } catch (error) {
      this.notice = `❌ Не удалось добавить транзакцию: ${errorMessage(error)}`;
    }
  }

  async removeTransaction(account: Account): Promise<void> {
    const transactions = account.getTransactions();
    if (transactions.length === 0) {
      this.notice = 'В этом счёте пока нет транзакций — удалять нечего';
      return;
    }

    this.showScreen(`Удаление транзакции — «${account.name}»`);

    const { transactionId } = await inquirer.prompt<{ transactionId: string | null }>([
      {
        type: 'select',
        name: 'transactionId',
        message: 'Какую транзакцию удалить?',
        pageSize: 12,
        choices: [
          ...transactions.map((t) => ({ name: t.toString(), value: t.id })),
          new inquirer.Separator(),
          { name: '↩  Отмена', value: null },
        ],
      },
    ]);
    if (transactionId === null) {
      return;
    }

    const transaction = transactions.find((t) => t.id === transactionId);
    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Удалить «${transaction?.description}» (${transaction?.formattedAmount})?`,
        default: false,
      },
    ]);
    if (!confirmed) {
      this.notice = 'Удаление отменено';
      return;
    }

    if (account.removeTransactionById(transactionId)) {
      await this.save();
      this.notice = '✅ Транзакция удалена';
    } else {
      this.notice = '❌ Транзакция не найдена';
    }
  }

  async removeAccount(account: Account): Promise<boolean> {
    const count = account.transactionCount;
    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Удалить счёт «${account.name}» вместе со всеми транзакциями (${count})? Это нельзя отменить.`,
        default: false,
      },
    ]);
    if (!confirmed) {
      this.notice = 'Удаление счёта отменено';
      return false;
    }

    this.accountManager.removeAccountById(account.id);
    await this.save();
    this.notice = `✅ Счёт «${account.name}» удалён`;
    return true;
  }

  async exportTransactionsToCSV(account: Account): Promise<void> {
    if (account.transactionCount === 0) {
      this.notice = 'В счёте нет транзакций — экспортировать нечего';
      return;
    }

    const { fileName } = await inquirer.prompt<{ fileName: string }>([
      {
        type: 'input',
        name: 'fileName',
        message: 'Имя файла (без расширения):',
        default: `${toSafeFileName(account.name)}_${moment().format('YYYY-MM-DD')}`,
        validate: validateFileName,
      },
    ]);

    const filePath = path.resolve(this.exportDir, `${normalizeFileName(fileName)}.csv`);

    if (await fileExists(filePath)) {
      const { overwrite } = await inquirer.prompt<{ overwrite: boolean }>([
        { type: 'confirm', name: 'overwrite', message: 'Такой файл уже есть. Перезаписать?', default: false },
      ]);
      if (!overwrite) {
        this.notice = 'Экспорт отменён';
        return;
      }
    }

    try {
      await account.exportTransactionsToCSV(filePath);
      this.notice = `✅ Экспортировано транзакций: ${account.transactionCount}. Файл: ${filePath}`;
    } catch (error) {
      this.notice = `❌ ${errorMessage(error)}`;
    }
  }

  private async renameAccount(account: Account): Promise<void> {
    const otherNames = this.accountManager.getAccountNames().filter((name) => name !== account.name);
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Новое название:',
        default: account.name,
        validate: (input: string) => validateAccountName(input, otherNames),
      },
    ]);

    account.update({ name });
    await this.save();
    this.notice = `✅ Счёт переименован в «${account.name}»`;
  }

  private async selectMainMenuItem(): Promise<MainMenuChoice> {
    const accountChoices = this.accountManager.getAllAccounts().map((account) => ({
      name: `${account.name} (${formatCurrency(account.balance)})`,
      value: { kind: 'account', accountId: account.id } as MainMenuChoice,
    }));

    const { choice } = await inquirer.prompt<{ choice: MainMenuChoice }>([
      {
        type: 'select',
        name: 'choice',
        message: accountChoices.length > 0 ? 'Выберите счёт или действие:' : 'Счетов пока нет. Что сделать?',
        pageSize: 12,
        choices: [
          ...accountChoices,
          new inquirer.Separator(),
          { name: '➕ Создать новый счёт', value: { kind: 'create' } },
          { name: '🚪 Выход', value: { kind: 'exit' } },
        ],
      },
    ]);
    return choice;
  }

  private showScreen(title: string): void {
    // в режиме --debug экран не чистим, иначе логи декораторов сразу пропадают
    if (isDecoratorLoggingEnabled()) {
      console.log('\n' + '─'.repeat(60));
    } else {
      console.clear();
    }
    console.log(`💰 Budget Tracker — ${title}\n`);
    if (this.notice) {
      console.log(this.notice + '\n');
      this.notice = null;
    }
  }
}
