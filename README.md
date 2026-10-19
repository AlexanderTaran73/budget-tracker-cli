# Budget Tracker CLI

Консольное приложение для учёта личных финансов: счета, доходы, расходы и баланс.
Учебный проект по курсу «Программирование на TypeScript».

Сейчас в проекте реализованы классы `Transaction`, `Account` и `AccountManager` (ДЗ по теме 5 «Классы и ООП»).

## Установка и запуск

Нужен Node.js 18+.

```bash
npm install
npm run build
npm start
```

Остальные скрипты:

- `npm run dev` — компиляция в режиме наблюдения
- `npm run calc` — демо базовых вычислений (`calculation-demo.ts`)
- `npm run functions` — демо функций для анализа бюджета (`functions.ts`)

## Структура

```
src/
├── index.ts             — пример работы с классами
├── classes.ts           — Transaction, Account, AccountManager
├── types.ts             — интерфейсы и типы
├── functions.ts         — функции для подсчёта сумм и средних
└── calculation-demo.ts  — простые вычисления бюджета
```

## Классы

- **Transaction** — одна операция: сумма, тип (`income` / `expense`), дата в ISO-формате, описание. При создании проверяет, что сумма больше нуля и дата корректная.
- **Account** — счёт с транзакциями. Геттеры `income`, `expenses`, `balance`, методы `addTransaction`, `removeTransactionById`, `getTransactions`, `getSummary`, `getSummaryString`. `toString()` выводит счёт таблицей.
- **AccountManager** — список счетов и общая сводка: `addAccount`, `removeAccountById`, `getAccountById`, `getAllAccounts`, `getSummary`, `getSummaryString`, `toString()`.
