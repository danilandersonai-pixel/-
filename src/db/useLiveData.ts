import { useEffect, useState } from 'react';

import { subscribeToChanges, type TableName } from './changes';

export type LiveData<T> = { data: T | undefined; error: Error | undefined };

/**
 * Загружает данные и перечитывает их при каждом изменении таблицы (или любой из списка).
 * `load` и список таблиц должны быть стабильными (объявлены вне компонента или через useCallback).
 */
export function useLiveData<T>(table: TableName | readonly TableName[], load: () => Promise<T>): LiveData<T> {
  const [state, setState] = useState<LiveData<T>>({ data: undefined, error: undefined });

  useEffect(() => {
    let active = true;
    const refresh = () => {
      load().then(
        (data) => active && setState({ data, error: undefined }),
        (error: unknown) =>
          active && setState({ data: undefined, error: error instanceof Error ? error : new Error(String(error)) }),
      );
    };
    refresh();
    const unsubscribers = (typeof table === 'string' ? [table] : table).map((name) => subscribeToChanges(name, refresh));
    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [table, load]);

  return state;
}
