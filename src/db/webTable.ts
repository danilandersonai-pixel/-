// Простая «таблица» для браузерного превью: строки в памяти + копия в localStorage.
// На телефоне не используется — там настоящая база SQLite.

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type WebTable<Row extends { id: string }> = {
  all(): Row[];
  get(id: string): Row | null;
  upsert(row: Row): void;
};

/** localStorage, если он доступен (в приватном режиме доступ может бросить ошибку) */
export function getBrowserStorage(): KeyValueStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createWebTable<Row extends { id: string }>(
  name: string,
  storage: KeyValueStorage | null,
): WebTable<Row> {
  const key = `sport-tracker:${name}`;
  let rows: Row[] | null = null;

  function load(): Row[] {
    if (rows) {
      return rows;
    }
    try {
      const parsed: unknown = JSON.parse(storage?.getItem(key) ?? '[]');
      rows = Array.isArray(parsed) ? (parsed as Row[]) : [];
    } catch {
      rows = [];
    }
    return rows;
  }

  function persist(list: Row[]): void {
    try {
      storage?.setItem(key, JSON.stringify(list));
    } catch {
      // Хранилище недоступно или переполнено — данные останутся в памяти до перезагрузки
    }
  }

  return {
    all: () => [...load()],
    get: (id) => load().find((row) => row.id === id) ?? null,
    upsert: (row) => {
      const list = load();
      const index = list.findIndex((existing) => existing.id === row.id);
      if (index >= 0) {
        list[index] = row;
      } else {
        list.push(row);
      }
      persist(list);
    },
  };
}
