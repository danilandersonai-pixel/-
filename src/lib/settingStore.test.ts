import { createSetting, parseJson } from './settingStore';

function memory() {
  const data = new Map<string, string>();
  return { data, read: (key: string) => data.get(key) ?? null, write: (key: string, value: string) => void data.set(key, value) };
}

describe('настройки телефона', () => {
  it('читает, сохраняет и сообщает подписчикам', () => {
    const backend = memory();
    backend.data.set('n', '5');
    const setting = createSetting(backend, 'n', (raw) => Number(raw ?? 0));
    expect(setting.get()).toBe(5);
    const seen: number[] = [];
    const unsubscribe = setting.subscribe(() => seen.push(setting.get()));
    setting.set(7);
    unsubscribe();
    setting.set(9);
    expect(seen).toEqual([7]);
    expect(backend.data.get('n')).toBe('9');
  });

  it('сломанное хранилище не ломает приложение', () => {
    const broken = {
      read: () => {
        throw new Error('нет доступа');
      },
      write: () => {
        throw new Error('нет доступа');
      },
    };
    const setting = createSetting(broken, 'x', (raw) => raw ?? 'по умолчанию');
    expect(setting.get()).toBe('по умолчанию');
    setting.set('новое');
    expect(setting.get()).toBe('новое');
  });

  it('JSON: битое значение — по умолчанию', () => {
    const isObj = (v: unknown): v is { a: number } => typeof v === 'object' && v !== null && typeof (v as { a?: unknown }).a === 'number';
    expect(parseJson('{"a":1}', { a: 0 }, isObj)).toEqual({ a: 1 });
    expect(parseJson('не json', { a: 0 }, isObj)).toEqual({ a: 0 });
    expect(parseJson('{"a":"строка"}', { a: 0 }, isObj)).toEqual({ a: 0 });
    expect(parseJson(null, { a: 0 }, isObj)).toEqual({ a: 0 });
  });
});
