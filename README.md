# Budget Tracker CLI

Консольное приложение для учёта личных финансов. Можно вести несколько счетов, добавлять доходы и расходы,
смотреть баланс и выгружать операции в CSV. Всё управление — через интерактивное меню в терминале
(библиотека [inquirer](https://www.npmjs.com/package/inquirer)).

Итоговый проект курса «Программирование на TypeScript».

## Установка и запуск

Нужен Node.js 20 или новее.

```bash
git clone https://github.com/AlexanderTaran73/budget-tracker-cli.git
cd budget-tracker-cli
npm install
npm start
```

Отдельная сборка не нужна — `npm start` запускает TypeScript напрямую через [tsx](https://www.npmjs.com/package/tsx).

| Команда          | Что делает                                                              |
|------------------|-------------------------------------------------------------------------|
| `npm start`      | запуск приложения                                                       |
| `npm run reset`  | запуск с демонстрационными данными (сохранённые данные перезаписываются) |
| `npm run debug`  | запуск с логами декораторов (`@LogClass`, `@LogMethod`)                  |
| `npm run demo`   | неинтерактивная демонстрация утилитных типов, декораторов и экспорта CSV |
| `npm run build`  | проверка типов (`tsc`)                                                  |
| `npm test`       | юнит-тесты (vitest)                                                     |

## Как пользоваться

Управление стрелками ↑ ↓ и Enter. Выйти можно через пункт «Выход» в главном меню или Ctrl+C.

**Главное меню** — таблица всех счетов с доходами, расходами и балансом. Можно выбрать счёт, создать новый или выйти.

**Экран счёта** — таблица транзакций и действия:

- **Добавить транзакцию** — тип (доход/расход), сумма, дата (`ГГГГ-ММ-ДД`, по умолчанию сегодня) и описание.
  Ввод проверяется: сумма больше нуля и не больше двух знаков после запятой, дата существует и не в будущем,
  описание не пустое. Перед сохранением приложение показывает итог и просит подтверждение. Если сумма больше
  обычного лимита (500 000 ₽ для доходов, 100 000 ₽ для расходов), оно дополнительно переспрашивает.
- **Удалить транзакцию** — выбор из списка и подтверждение.
- **Экспортировать в CSV** — запрашивает имя файла без расширения, файл сохраняется в папку `exports/`.
  Если такой файл уже есть, приложение спросит, перезаписать ли его.
- **Переименовать счёт**.
- **Удалить счёт** — после подтверждения удаляется вместе со всеми транзакциями.

При первом запуске создаются два демонстрационных счёта. Все изменения сохраняются в `data/budget.json`
и подхватываются при следующем запуске. Если файл повреждён, приложение сохраняет его копию
(`budget.broken-<время>.json`), сообщает об этом и стартует с демонстрационными данными.

### Формат CSV

```
id,amount,type,date,description
d8be09eb-1902-47b1-90d6-43ea6b469621,1000,income,2023-01-01T00:00:00Z,Зарплата
cecb5c8f-d01b-4430-90ea-a79ac0c880b3,2500.5,income,2026-10-20T00:00:00.000Z,"Подработка, ""вечер"""
```

Значения с запятыми, кавычками и переносами строк экранируются. Файл записывается в UTF-8 с BOM,
поэтому кириллица нормально открывается в Excel.

## Структура проекта

```
src/
├── interfaces/
│   ├── TransactionType.ts
│   ├── Identifiable.ts
│   ├── ITransaction.ts
│   ├── IAccount.ts
│   ├── ISummary.ts
│   ├── IAccountManager.ts
│   ├── utility-types.ts       — Partial, Pick, Omit, Record, ConstructorParameters и др.
│   └── mapped-types.ts        — TransactionFieldType, OptionalTransaction, ReadonlyTransactionFields, IsIncome
├── classes/
│   ├── Transaction.ts
│   ├── Account.ts
│   ├── AccountManager.ts
│   ├── ApplicationController.ts  — интерактивное меню
│   ├── GenericStorage.ts         — обобщённое хранилище GenericStorage<T extends Identifiable>
│   └── BudgetStorage.ts          — сохранение и загрузка data/budget.json
├── lib/
│   ├── budget-utils.js        — нетипизированная JS-библиотека (formatCurrency)
│   ├── budget-utils.d.ts      — декларация типов для неё
│   └── moment-locales.d.ts
├── utils/
│   ├── escapeCsvValue.ts
│   ├── validators.ts          — проверка пользовательского ввода
│   └── format.ts              — даты, подписи, таблицы
├── decorators/
│   ├── LogClass.ts
│   ├── LogMethod.ts
│   ├── ReadOnly.ts
│   ├── Metadata.ts
│   └── debug.ts               — включение/выключение логов декораторов
├── demo.ts
└── index.ts                   — точка входа, начальные данные
tests/                         — юнит-тесты
```

## Классы

- **Transaction** — операция: сумма, тип, дата (ISO), описание. `id` генерируется через `uuid`. Проверяет данные
  при создании и в `update()`.
- **Account** — счёт. Транзакции хранятся в `GenericStorage<Transaction>`. Геттеры `income` / `expenses` / `balance`,
  методы `addTransaction`, `removeTransactionById`, `getTransactions`, `update`, `getSummary`, `getSummaryString`,
  асинхронный `exportTransactionsToCSV`. На классе висят декораторы `@LogClass`, `@LogMethod`, `@ReadOnly` (на `id`)
  и `@Metadata` (на `transactions`). Описание из метаданных выводится в `getSummaryString()`.
- **AccountManager** — набор счетов (`GenericStorage<Account>`) и общая сводка.
- **ApplicationController** — всё взаимодействие с пользователем: `start`, `createAccount`, `watchAccount`,
  `addTransaction`, `removeTransaction`, `removeAccount`, `exportTransactionsToCSV`.
- **BudgetStorage** — чтение и запись JSON с проверкой структуры файла.

## Темы курса в проекте

| Тема | Где смотреть |
|---|---|
| 4. Интерфейсы и типы | `src/interfaces/` — `TransactionType`, `ITransaction`, `IAccount`, `ISummary`, `IAccountManager` |
| 5. Классы и ООП | `src/classes/Transaction.ts`, `Account.ts`, `AccountManager.ts` |
| 6. Generics | `src/classes/GenericStorage.ts` — хранилище для транзакций и счетов |
| 7–8. Модули, declaration files | ES-модули, `src/lib/budget-utils.js` + `budget-utils.d.ts`, `uuid`, `moment` |
| 9. Утилитные типы | `src/interfaces/utility-types.ts`, методы `update()` у `Transaction` и `Account` |
| 10. Асинхронный код | `src/utils/escapeCsvValue.ts`, `Account.exportTransactionsToCSV()`, `BudgetStorage` |
| 11. Conditional и mapped types | `src/interfaces/mapped-types.ts`, примеры в `src/demo.ts`, проверки типов в `tests/types.test.ts` |
| 12. Декораторы | `src/decorators/`, см. раздел ниже |
| Итоговое | `src/classes/ApplicationController.ts`, `src/index.ts` |

## Декораторы (тема 12)

| Декоратор | Файл | Где применяется |
|---|---|---|
| `@LogClass` — пишет `Создан экземпляр класса <имя> с аргументами: …` | `src/decorators/LogClass.ts` | класс `Account` |
| `@LogMethod` — пишет `Вызов метода <имя> с аргументами: …` и `Метод <имя> вернул: …` | `src/decorators/LogMethod.ts` | `addTransaction`, `removeTransactionById`, `getTransactions` |
| `@ReadOnly` — после первой установки значения бросает ошибку при попытке изменить свойство | `src/decorators/ReadOnly.ts` | `Account.id` (модификатор `readonly` убран) |
| `@Metadata(key, value)` — сохраняет метаданные через `reflect-metadata` | `src/decorators/Metadata.ts` | `Account.transactions` — `@Metadata('description', 'Транзакции счёта')` |

Описание из метаданных выводится в `Account.getSummaryString()`: `Личный бюджет: баланс 650 ₽, транзакции счёта: 3`.

Как проверить:

- `npm run demo` — пример по шаблону задания: создание счёта и транзакций с логами декораторов, попытка изменить `id`
  (`Свойство "id" доступно только для чтения`) и вывод `getSummaryString()` с описанием из метаданных.
  Пример вынесен в `src/demo.ts`, потому что `src/index.ts` в итоговом проекте запускает интерактивное меню.
- `npm run debug` — обычное приложение, но с включёнными логами. Экран в этом режиме не очищается, поэтому видно,
  какие методы вызываются при каждом действии в меню.
- `tests/Account.test.ts` — тесты на `@ReadOnly` и `@Metadata`.

## Технические детали

- TypeScript 6 в строгом режиме (`strict`), ES-модули.
- `any` используется в одном месте — в `LogClass`: TypeScript требует, чтобы конструктор mixin-класса принимал
  именно `...args: any[]`.
- `uuid` и `moment` поставляются со своими типами, поэтому пакеты `@types/*` для них не нужны.
- `budget-utils` подключается по имени через `paths` в `tsconfig.json`, а в тестах — через `alias` в `vitest.config.ts`.
- Логи декораторов по умолчанию выключены, чтобы не мешать меню. Включаются флагом `--debug`.
