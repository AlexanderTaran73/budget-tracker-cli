import { describe, expect, it } from 'vitest';
import { escapeCsvValue } from '../src/utils/escapeCsvValue';

describe('escapeCsvValue', () => {
  it('не трогает обычные значения', () => {
    expect(escapeCsvValue('Продукты')).toBe('Продукты');
    expect(escapeCsvValue(1500.5)).toBe('1500.5');
  });

  it('оборачивает в кавычки значения с запятой, кавычками и переносами', () => {
    expect(escapeCsvValue('Кафе, ужин')).toBe('"Кафе, ужин"');
    expect(escapeCsvValue("Магазин 'У дома'")).toBe(`"Магазин 'У дома'"`);
    expect(escapeCsvValue('строка\nвторая')).toBe('"строка\nвторая"');
  });

  it('удваивает двойные кавычки внутри значения', () => {
    expect(escapeCsvValue('Кафе "Ромашка"')).toBe('"Кафе ""Ромашка"""');
  });
});
