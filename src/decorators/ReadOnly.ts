export function ReadOnly(target: object, propertyKey: string): void {
  const values = new WeakMap<object, unknown>();

  Object.defineProperty(target, propertyKey, {
    get(this: object): unknown {
      return values.get(this);
    },
    set(this: object, value: unknown): void {
      if (values.has(this)) {
        throw new Error(`Свойство "${propertyKey}" доступно только для чтения`);
      }
      values.set(this, value);
    },
    enumerable: true,
    configurable: false,
  });
}
