import moment from 'moment';
import 'moment/locale/ru';
import { TransactionType } from '../interfaces/TransactionType';

moment.locale('ru');

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'доход',
  expense: 'расход',
};

export function formatDate(isoDate: string): string {
  return moment.utc(isoDate).format('LL');
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

export function drawTable(title: string, headers: string[], rows: string[][], footer: string[] = []): string {
  const widths = headers.map((header, i) => Math.max(header.length, ...rows.map((row) => row[i].length)));

  // если заголовок или итоги длиннее колонок — расширяем последнюю колонку
  const columnsWidth = widths.reduce((sum, w) => sum + w + 3, -1);
  const longestText = Math.max(title.length, ...footer.map((line) => line.length)) + 2;
  if (longestText > columnsWidth) {
    widths[widths.length - 1] += longestText - columnsWidth;
  }
  const innerWidth = Math.max(columnsWidth, longestText);

  const border = (left: string, fill: string, cross: string, right: string): string =>
    left + widths.map((w) => fill.repeat(w + 2)).join(cross) + right;
  const row = (cells: string[]): string => '║' + cells.map((cell, i) => ` ${cell.padEnd(widths[i])} `).join('│') + '║';
  const wideRow = (text: string): string => `║ ${text.padEnd(innerWidth - 2)} ║`;

  const lines: string[] = [
    '╔' + '═'.repeat(innerWidth) + '╗',
    wideRow(title),
    border('╠', '═', '╤', '╣'),
    row(headers),
    border('╟', '─', '┼', '╢'),
    ...rows.map(row),
  ];

  if (footer.length > 0) {
    lines.push(border('╟', '─', '┴', '╢'), ...footer.map(wideRow), '╚' + '═'.repeat(innerWidth) + '╝');
  } else {
    lines.push(border('╚', '═', '╧', '╝'));
  }

  return lines.join('\n');
}
