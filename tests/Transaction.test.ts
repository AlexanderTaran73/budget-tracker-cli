import { describe, expect, it } from 'vitest';
import { Transaction } from '../src/classes/Transaction';

describe('Transaction', () => {
  it('генерирует уникальный id', () => {
    const a = new Transaction(100, 'income', '2023-01-01T00:00:00Z', 'Зарплата');
    const b = new Transaction(100, 'income', '2023-01-01T00:00:00Z', 'Зарплата');
    expect(a.id).not.toBe(b.id);
  });

  it('не создаётся с некорректными данными', () => {
    expect(() => new Transaction(0, 'income', '2023-01-01T00:00:00Z', 'x')).toThrow();
    expect(() => new Transaction(100, 'income', '01.01.2023', 'x')).toThrow();
    expect(() => new Transaction(100, 'income', '2023-01-01T00:00:00Z', '  ')).toThrow();
  });

  it('обновляет поля через update и валидирует их', () => {
    const t = new Transaction(100, 'expense', '2023-01-01T00:00:00Z', 'Кофе');
    t.update({ amount: 150, description: 'Кофе и круассан' });
    expect(t.amount).toBe(150);
    expect(t.description).toBe('Кофе и круассан');

    expect(() => t.update({ amount: -1 })).toThrow();
    expect(t.amount).toBe(150);
  });

  it('форматирует строку для вывода', () => {
    const t = new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата');
    // toLocaleString разделяет тысячи неразрывным пробелом
    expect(t.toString()).toContain('Зарплата (доход 1 000 ₽) | 1 января 2023 г.');
  });
});
