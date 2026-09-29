import { createWebTable, type KeyValueStorage } from './webTable';

type Row = { id: string; name: string };

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe('createWebTable', () => {
  it('добавляет и обновляет строки', () => {
    const table = createWebTable<Row>('test', memoryStorage());
    table.upsert({ id: '1', name: 'Анна' });
    table.upsert({ id: '2', name: 'Иван' });
    table.upsert({ id: '1', name: 'Анна П.' });
    expect(table.all()).toEqual([
      { id: '1', name: 'Анна П.' },
      { id: '2', name: 'Иван' },
    ]);
    expect(table.get('2')?.name).toBe('Иван');
    expect(table.get('3')).toBeNull();
  });

  it('данные переживают перезагрузку', () => {
    const storage = memoryStorage();
    createWebTable<Row>('test', storage).upsert({ id: '1', name: 'Анна' });
    const reopened = createWebTable<Row>('test', storage);
    expect(reopened.all()).toEqual([{ id: '1', name: 'Анна' }]);
  });

  it('работает, если хранилище сломано или недоступно', () => {
    const broken: KeyValueStorage = {
      getItem: () => 'не JSON',
      setItem: () => {
        throw new Error('квота');
      },
    };
    const table = createWebTable<Row>('test', broken);
    expect(table.all()).toEqual([]);
    table.upsert({ id: '1', name: 'Анна' });
    expect(table.all()).toHaveLength(1);

    const noStorage = createWebTable<Row>('test', null);
    noStorage.upsert({ id: '1', name: 'Анна' });
    expect(noStorage.get('1')?.name).toBe('Анна');
  });
});
