import { Identifiable } from '../interfaces/Identifiable';

export class GenericStorage<T extends Identifiable> {
  private items: T[] = [];

  get size(): number {
    return this.items.length;
  }

  add(item: T): void {
    if (this.getById(item.id)) {
      throw new Error(`Элемент с id ${item.id} уже есть в хранилище`);
    }
    this.items.push(item);
  }

  removeById(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  getById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
