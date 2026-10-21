import { debugLog, stringifyForLog } from './debug';

export function LogMethod<T extends (...args: never[]) => unknown>(
  _target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
): void {
  const original = descriptor.value;
  if (!original) {
    return;
  }

  descriptor.value = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    debugLog(`Вызов метода ${propertyKey} с аргументами: ${stringifyForLog(args)}`);
    const result = original.apply(this, args) as ReturnType<T>;
    debugLog(`Метод ${propertyKey} вернул: ${stringifyForLog(result)}`);
    return result;
  } as T;
}
