// Оповещение об изменениях в базе: экраны подписываются на таблицу
// и перечитывают данные, когда в неё что-то записали.

export type TableName = 'clients' | 'consents' | 'health' | 'measurements' | 'photos' | 'workouts' | 'nutrition' | 'goals';

type Listener = () => void;

const listeners = new Map<TableName, Set<Listener>>();

export function notifyChange(table: TableName): void {
  listeners.get(table)?.forEach((listener) => listener());
}

export function subscribeToChanges(table: TableName, listener: Listener): () => void {
  const set = listeners.get(table) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(table, set);
  return () => {
    set.delete(listener);
  };
}
