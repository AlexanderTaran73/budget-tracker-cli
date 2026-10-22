import { describe, expectTypeOf, it } from 'vitest';
import { Transaction } from '../src/classes/Transaction';
import { ITransaction } from '../src/interfaces/ITransaction';
import {
  IsIncome,
  OptionalTransaction,
  ReadonlyTransactionFields,
  TransactionFieldType,
} from '../src/interfaces/mapped-types';
import { TransactionType } from '../src/interfaces/TransactionType';
import {
  CategoryLimits,
  CompleteTransaction,
  TransactionConstructorParams,
  TransactionInstance,
  TransactionPreview,
} from '../src/interfaces/utility-types';

// эти проверки выполняет компилятор (npm run build), в рантайме они ничего не делают
describe('mapped и conditional types', () => {
  it('TransactionFieldType возвращает тип поля или never', () => {
    expectTypeOf<TransactionFieldType<'amount'>>().toEqualTypeOf<number>();
    expectTypeOf<TransactionFieldType<'type'>>().toEqualTypeOf<TransactionType>();
    expectTypeOf<TransactionFieldType<'unknown'>>().toEqualTypeOf<never>();
  });

  it('OptionalTransaction делает опциональными только указанные поля', () => {
    type Draft = OptionalTransaction<'description' | 'date'>;
    expectTypeOf<Draft['description']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Draft['date']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Draft['amount']>().toEqualTypeOf<number>();
    expectTypeOf<{ id: string; amount: number; type: 'income' }>().toExtend<Draft>();
  });

  it('ReadonlyTransactionFields запрещает запись в указанные поля', () => {
    type Fixed = ReadonlyTransactionFields<'id' | 'type'>;
    const value: Fixed = { id: '1', type: 'income', amount: 1, date: '2023-01-01', description: 'x' };
    value.amount = 2;
    // @ts-expect-error — type только для чтения
    value.type = 'expense';
    expectTypeOf(value).toExtend<ITransaction>();
  });

  it('IsIncome различает доходы', () => {
    expectTypeOf<IsIncome<{ type: 'income'; amount: number }>>().toEqualTypeOf<true>();
    expectTypeOf<IsIncome<{ type: 'expense'; amount: number }>>().toEqualTypeOf<false>();
    expectTypeOf<IsIncome<ITransaction>>().toEqualTypeOf<false>();
  });
});

describe('utility types', () => {
  it('описывают части транзакции и параметры конструктора', () => {
    expectTypeOf<TransactionPreview>().toEqualTypeOf<Pick<ITransaction, 'id' | 'amount' | 'type' | 'date'>>();
    expectTypeOf<CompleteTransaction['description']>().toEqualTypeOf<string>();
    expectTypeOf<CategoryLimits>().toEqualTypeOf<{ income: number; expense: number }>();
    expectTypeOf<TransactionConstructorParams[0]>().toEqualTypeOf<number>();
    expectTypeOf<TransactionInstance>().toEqualTypeOf<Transaction>();
  });
});
