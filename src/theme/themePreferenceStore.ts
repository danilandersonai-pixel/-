// Выбор темы тренером и итоговая тема. Чистая логика — хранение в themePreference.ts.

import type { ColorScheme } from './colors';

export type ThemePreference = 'system' | 'dark' | 'light';

const values: readonly ThemePreference[] = ['system', 'dark', 'light'];

export function parseThemePreference(raw: string | null): ThemePreference {
  return values.find((v) => v === raw) ?? 'system';
}

/**
 * Итоговая тема: выбор тренера важнее всего; «авто» — тема, заданная просмотрщиком
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
