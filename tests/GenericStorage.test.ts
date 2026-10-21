import { describe, expect, it } from 'vitest';
import { GenericStorage } from '../src/classes/GenericStorage';

interface Item {
  id: string;
  title: string;
}

describe('GenericStorage', () => {
  it('добавляет, находит и удаляет элементы', () => {
    const storage = new GenericStorage<Item>();
    storage.add({ id: 'a', title: 'Первый' });
    storage.add({ id: 'b', title: 'Второй' });

    expect(storage.size).toBe(2);
    expect(storage.getById('b')?.title).toBe('Второй');
    expect(storage.getById('x')).toBeUndefined();
    expect(storage.removeById('a')).toBe(true);
    expect(storage.removeById('a')).toBe(false);
    expect(storage.getAll().map((item) => item.id)).toEqual(['b']);
  });

  it('не принимает дубликаты id', () => {
    const storage = new GenericStorage<Item>();
    storage.add({ id: 'a', title: 'Первый' });
    expect(() => storage.add({ id: 'a', title: 'Копия' })).toThrow();
  });

  it('getAll возвращает копию массива', () => {
    const storage = new GenericStorage<Item>();
    storage.add({ id: 'a', title: 'Первый' });
    storage.getAll().length = 0;
    expect(storage.size).toBe(1);
  });
});
