// Выбор темы: хранение и подписка. Чистая логика — само хранилище передаётся снаружи.

import type { ColorScheme } from './colors';

export type ThemePreference = 'system' | 'dark' | 'light';

const values: readonly ThemePreference[] = ['system', 'dark', 'light'];

function parse(value: string | null): ThemePreference {
  return values.find((v) => v === value) ?? 'system';
}

type Backend = { read: () => string | null; write: (value: string) => void };

export function createPreferenceStore(backend: Backend) {
  let current: ThemePreference | null = null;
  const listeners = new Set<() => void>();

  const getThemePreference = (): ThemePreference => {
    if (current === null) {
      try {
        current = parse(backend.read());
      } catch {
        current = 'system';
      }
    }
    return current;
  };

  return {
    getThemePreference,
    setThemePreference(value: ThemePreference): void {
      current = value;
      try {
        backend.write(value);
      } catch {
        // Не сохранилось — выбор всё равно действует до перезапуска
      }
      listeners.forEach((listener) => listener());
    },
    subscribeThemePreference(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Итоговая тема: выбор тренера важнее всего; «как в системе» — тема, заданная просмотрщиком
 * (в браузерном превью), иначе тема телефона.
 */
export function resolveScheme(preference: ThemePreference, system: string | null | undefined, forced?: string | null): ColorScheme {
  if (preference !== 'system') {
    return preference;
  }
  if (forced === 'dark' || forced === 'light') {
    return forced;
  }
  return system === 'dark' ? 'dark' : 'light';
}
