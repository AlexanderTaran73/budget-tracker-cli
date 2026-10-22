// логи декораторов мешают интерактивному меню, поэтому по умолчанию выключены (включаются флагом --debug)
let loggingEnabled = false;

export function setDecoratorLogging(enabled: boolean): void {
  loggingEnabled = enabled;
}

export function isDecoratorLoggingEnabled(): boolean {
  return loggingEnabled;
}

export function debugLog(message: string): void {
  if (loggingEnabled) {
    console.log(`[debug] ${message}`);
  }
}

export function stringifyForLog(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
