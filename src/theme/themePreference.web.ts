// Браузерная версия themePreference.ts для превью: выбор темы в localStorage.

import { getBrowserStorage } from '@/db/webTable';

import { createPreferenceStore, type ThemePreference } from './themePreferenceStore';

const KEY = 'sport-tracker:themePreference';

const store = createPreferenceStore({
  read: () => {
    try {
      return getBrowserStorage()?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  },
  write: (value) => {
    try {
      getBrowserStorage()?.setItem(KEY, value);
    } catch {
      // Хранилище недоступно — выбор действует до перезагрузки
    }
  },
});

const api = {
  getThemePreference: store.getThemePreference,
  setThemePreference: store.setThemePreference,
  subscribeThemePreference: store.subscribeThemePreference,
} satisfies Omit<typeof import('./themePreference'), 'ThemePreference'>;

export const { getThemePreference, setThemePreference, subscribeThemePreference } = api;
export type { ThemePreference };
