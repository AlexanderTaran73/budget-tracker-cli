export function formatCurrency(amount, symbol = '₽') {
  const formatted = amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  return formatted + ' ' + symbol;
}
