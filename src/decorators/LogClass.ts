import { debugLog, stringifyForLog } from './debug';

// TypeScript требует у mixin-конструктора сигнатуру именно с any[] — с unknown[] наследование не скомпилируется
type Constructor = new (...args: any[]) => object;

export function LogClass<T extends Constructor>(constructor: T): T {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      debugLog(`Создан экземпляр класса ${constructor.name} с аргументами: ${stringifyForLog(args)}`);
    }
  };
}
