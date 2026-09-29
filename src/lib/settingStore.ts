// Настройка телефона: значение по ключу в хранилище «ключ — значение» с подпиской на изменения.
// Само хранилище передаётся снаружи (на телефоне — expo-sqlite/kv-store, в превью — localStorage),
// поэтому здесь чистая логика, которую легко проверить тестами.

export type SettingBackend = {
  read(key: string): string | null;
  write(key: string, value: string): void;
};

export type Setting<T> = {
  get(): T;
  set(value: T): void;
  subscribe(listener: () => void): () => void;
};

/**
 * parse превращает сохранённую строку (или null, если ничего не сохранено) в значение,
 * serialize — обратно. Сломанное хранилище не ломает приложение: значение живёт в памяти.
 */
export function createSetting<T>(
  backend: SettingBackend,
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string = String,
): Setting<T> {
  let loaded = false;
  let current: T;
  const listeners = new Set<() => void>();

  return {
    get() {
      if (!loaded) {
        let raw: string | null = null;
        try {
          raw = backend.read(key);
        } catch {
          raw = null;
        }
        current = parse(raw);
        loaded = true;
      }
      return current;
    },
    set(value) {
      current = value;
      loaded = true;
      try {
        backend.write(key, serialize(value));
      } catch {
        // Не сохранилось — значение всё равно действует до перезапуска
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Разбор JSON-настройки: битое или пустое значение — значение по умолчанию */
export function parseJson<T extends object>(raw: string | null, fallback: T, isValid: (value: unknown) => value is T): T {
  if (raw === null) {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
