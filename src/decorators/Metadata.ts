import 'reflect-metadata';

export function Metadata(key: string, value: unknown) {
  return (target: object, propertyKey: string): void => {
    Reflect.defineMetadata(key, value, target, propertyKey);
  };
}

export function readMetadata(key: string, target: object, propertyKey: string): unknown {
  return Reflect.getMetadata(key, target, propertyKey);
}
