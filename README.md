# Budget Tracker CLI

Консольное приложение для учёта личных финансов: счета, доходы, расходы и баланс.
Учебный проект по курсу «Программирование на TypeScript».

Текущий этап — тема 8 «Работа с типами из библиотек JavaScript (Declaration files)»:

- проект переведён с namespace на ES-модули и запускается через `tsx`;
- идентификаторы счетов и транзакций — строки, генерируются через [`uuid`](https://www.npmjs.com/package/uuid);
- даты выводятся через [`moment`](https://www.npmjs.com/package/moment) в формате `LL` с русской локалью;
- суммы форматируются функцией `formatCurrency` из собственной JS-библиотеки `src/lib/budget-utils.js`, типы для неё описаны в `budget-utils.d.ts`.

## Установка и запуск

Нужен Node.js 18+.

```bash
npm install
npm start
```

- `npm start` — запуск `src/index.ts` через `tsx`, без отдельной сборки
- `npm run dev` — запуск с перезапуском при изменении файлов
- `npm run build` — проверка типов (`tsc`, без генерации JS)

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
├── lib/
│   ├── budget-utils.js      — нетипизированная JS-библиотека
│   ├── budget-utils.d.ts    — декларация типов для неё
│   └── moment-locales.d.ts  — декларация для импорта локалей moment
├── utils/
│   └── format.ts            — даты, подписи типов, таблицы
└── index.ts
```

## Библиотеки и типы

- `uuid` и `moment` поставляются со своими типами, поэтому отдельные пакеты `@types/*` для них не нужны
  (`@types/uuid` устарел начиная с uuid 10).
- `budget-utils` подключается по имени модуля через `paths` в `tsconfig.json`:

  ```json
  "paths": { "budget-utils": ["./src/lib/budget-utils.js"] }
  ```

  Типы берутся из `declare module 'budget-utils'` в `budget-utils.d.ts`. `tsx` тоже понимает `paths`, поэтому
  при запуске импорт находит JS-файл.
- Для side-effect импорта `moment/locale/ru` нет типов, поэтому добавлен `declare module 'moment/locale/*'`.

## Классы

- **Transaction** — одна операция: сумма, тип (`income` / `expense`), дата в ISO-формате, описание. `id` генерируется в конструкторе. При создании проверяется, что сумма больше нуля и дата в формате ISO 8601.
- **Account** — счёт с транзакциями. Геттеры `income`, `expenses`, `balance`, методы `addTransaction`, `removeTransactionById`, `getTransactions`, `getSummary`, `getSummaryString`. `toString()` выводит счёт таблицей (в таблицах показываются первые 8 символов id).
- **AccountManager** — список счетов и общая сводка: `addAccount`, `removeAccountById`, `getAccountById`, `getAllAccounts`, `getSummary`, `getSummaryString`, `toString()`.

Предыдущие этапы можно посмотреть в истории коммитов.
