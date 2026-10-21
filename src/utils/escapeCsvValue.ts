export function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[,"'\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
