import moment from 'moment';
import { describe, expect, it } from 'vitest';
import {
  normalizeFileName,
  parseAmount,
  toIsoDate,
  validateAccountName,
  validateAmount,
  validateDate,
  validateDescription,
  validateFileName,
} from '../src/utils/validators';

describe('validateAmount / parseAmount', () => {
  it('принимает целые и дробные суммы с точкой или запятой', () => {
    expect(validateAmount('1500')).toBe(true);
    expect(validateAmount('99,90')).toBe(true);
    expect(validateAmount('1 000.5')).toBe(true);
    expect(parseAmount('99,90')).toBe(99.9);
    expect(parseAmount('1 000.5')).toBe(1000.5);
  });

  it('отклоняет пустые, отрицательные, нулевые и нечисловые значения', () => {
    expect(validateAmount('')).toBeTypeOf('string');
    expect(validateAmount('-100')).toBeTypeOf('string');
    expect(validateAmount('0')).toBeTypeOf('string');
    expect(validateAmount('abc')).toBeTypeOf('string');
    expect(validateAmount('10.555')).toBeTypeOf('string');
    expect(validateAmount('5000000000')).toBeTypeOf('string');
  });
});

describe('validateDate', () => {
  it('принимает дату в формате YYYY-MM-DD', () => {
    expect(validateDate('2024-02-29')).toBe(true);
    expect(toIsoDate('2024-02-29')).toBe('2024-02-29T00:00:00.000Z');
  });

  it('отклоняет неверный формат, несуществующие и будущие даты', () => {
    expect(validateDate('29.02.2024')).toBeTypeOf('string');
    expect(validateDate('2023-02-30')).toBeTypeOf('string');
    expect(validateDate('1999-12-31')).toBeTypeOf('string');
    expect(validateDate(moment().add(1, 'day').format('YYYY-MM-DD'))).toBeTypeOf('string');
  });
});

describe('текстовые поля', () => {
  it('проверяет описание', () => {
    expect(validateDescription('Продукты')).toBe(true);
    expect(validateDescription('   ')).toBeTypeOf('string');
    expect(validateDescription('x'.repeat(101))).toBeTypeOf('string');
  });

  it('проверяет уникальность названия счёта без учёта регистра', () => {
    expect(validateAccountName('Отпуск', ['Личный бюджет'])).toBe(true);
    expect(validateAccountName('личный БЮДЖЕТ', ['Личный бюджет'])).toBeTypeOf('string');
    expect(validateAccountName('')).toBeTypeOf('string');
  });

  it('проверяет имя файла', () => {
    expect(validateFileName('отчёт_январь')).toBe(true);
    expect(validateFileName('a/b')).toBeTypeOf('string');
    expect(validateFileName('  ')).toBeTypeOf('string');
    expect(normalizeFileName(' report.CSV ')).toBe('report');
  });
});
