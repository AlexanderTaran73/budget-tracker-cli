# Budget Tracker CLI

Консольное приложение для учёта личных финансов: счета, доходы, расходы и баланс.
Учебный проект по курсу «Программирование на TypeScript».

Текущий этап — тема 7 «Модули и пространства имён»: каждый интерфейс и класс лежит в отдельном файле,
все они объявлены в общем пространстве имён `BudgetTracker` и связаны через `/// <reference>`.
Проект собирается в один файл `dist/budget-tracker.js`.

## Установка и запуск

Нужен Node.js 18+.

```bash
npm install
npm run build
npm start
```

`npm run dev` — компиляция в режиме наблюдения.

## Структура

```
src/
├── interfaces/
│   ├── TransactionType.ts
│   ├── ITransaction.ts
│   ├── IAccount.ts
│   ├── ISummary.ts
│   └── IAccountManager.ts
├── classes/
│   ├── Transaction.ts
│   ├── Account.ts
│   └── AccountManager.ts
├── utils/
│   └── format.ts        — форматирование сумм, дат и таблиц
└── index.ts             — пример использования через BudgetTracker.*
```

## Классы

- **Transaction** — одна операция: сумма, тип (`income` / `expense`), дата в ISO-формате, описание. При создании проверяет, что сумма больше нуля и дата корректная.
- **Account** — счёт с транзакциями. Геттеры `income`, `expenses`, `balance`, методы `addTransaction`, `removeTransactionById`, `getTransactions`, `getSummary`, `getSummaryString`. `toString()` выводит счёт таблицей.
- **AccountManager** — список счетов и общая сводка: `addAccount`, `removeAccountById`, `getAccountById`, `getAllAccounts`, `getSummary`, `getSummaryString`, `toString()`.

## Про сборку

Для namespace-сборки в `tsconfig.json` используются `"module": "none"` и `outFile`. В TypeScript 6 эти опции
помечены устаревшими, поэтому добавлен `"ignoreDeprecations": "6.0"`, а версия TypeScript закреплена на 6.0.

Предыдущие этапы (классы в одном файле, generics) можно посмотреть в истории коммитов.
