import { formatCurrency } from 'budget-utils';
import moment from 'moment';
import { TransactionFieldType } from '../interfaces/mapped-types';

export type ValidationResult = true | string;

export const DATE_INPUT_FORMAT = 'YYYY-MM-DD';
export const MAX_AMOUNT = 1_000_000_000;
export const MAX_DESCRIPTION_LENGTH = 100;
export const MAX_ACCOUNT_NAME_LENGTH = 40;

const AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/;
const FORBIDDEN_FILENAME_CHARS = /[<>:"/\\|?*]/;

function normalizeAmount(input: string): string {
  return input.trim().replace(/\s/g, '');
}

export function parseAmount(input: string): TransactionFieldType<'amount'> {
  return Number(normalizeAmount(input).replace(',', '.'));
}

export function validateAmount(input: string): ValidationResult {
  const value = normalizeAmount(input);
  if (value === '') {
    return 'Введите сумму';
  }
  if (!AMOUNT_PATTERN.test(value)) {
    return 'Сумма должна быть положительным числом, не больше двух знаков после запятой (например, 1500 или 99,90)';
  }

  const amount = parseAmount(value);
  if (amount <= 0) {
    return 'Сумма должна быть больше нуля';
  }
  if (amount > MAX_AMOUNT) {
    return `Сумма не может быть больше ${formatCurrency(MAX_AMOUNT)}`;
  }
  return true;
}

export function validateDate(input: string): ValidationResult {
  const date = moment(input.trim(), DATE_INPUT_FORMAT, true);
  if (!date.isValid()) {
    return 'Введите дату в формате ГГГГ-ММ-ДД, например 2024-03-15';
  }
  if (date.year() < 2000) {
    return 'Дата не может быть раньше 2000 года';
  }
  if (date.isAfter(moment(), 'day')) {
    return 'Дата не может быть в будущем';
  }
  return true;
}

export function toIsoDate(input: string): TransactionFieldType<'date'> {
  return moment.utc(input.trim(), DATE_INPUT_FORMAT, true).toISOString();
}

export function validateDescription(input: string): ValidationResult {
  const value = input.trim();
  if (value === '') {
    return 'Описание не может быть пустым';
  }
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Описание слишком длинное (максимум ${MAX_DESCRIPTION_LENGTH} символов)`;
  }
  return true;
}

export function validateAccountName(input: string, takenNames: string[] = []): ValidationResult {
  const value = input.trim();
  if (value === '') {
    return 'Название счёта не может быть пустым';
  }
  if (value.length > MAX_ACCOUNT_NAME_LENGTH) {
    return `Название слишком длинное (максимум ${MAX_ACCOUNT_NAME_LENGTH} символов)`;
  }
  if (takenNames.some((name) => name.toLowerCase() === value.toLowerCase())) {
    return `Счёт с названием "${value}" уже существует`;
  }
  return true;
}

export function normalizeFileName(input: string): string {
  return input.trim().replace(/\.csv$/i, '');
}

export function validateFileName(input: string): ValidationResult {
  const value = normalizeFileName(input);
  if (value === '') {
    return 'Введите имя файла';
  }
  if (FORBIDDEN_FILENAME_CHARS.test(value)) {
    return 'Имя файла не должно содержать символы < > : " / \\ | ? *';
  }
  if (value.length > 100) {
    return 'Имя файла слишком длинное';
  }
  return true;
}

export function toSafeFileName(text: string): string {
  return text.replace(/[<>:"/\\|?*]/g, '').trim().replace(/\s+/g, '_');
}
