// Выбор темы тренером: «как в системе», всегда тёмная или всегда светлая.
// Хранится на телефоне в хранилище «ключ — значение» из expo-sqlite, никуда не отправляется.

import Storage from 'expo-sqlite/kv-store';

import { createPreferenceStore, type ThemePreference } from './themePreferenceStore';

const KEY = 'themePreference';

const store = createPreferenceStore({
  read: () => Storage.getItemSync(KEY),
  write: (value) => Storage.setItemSync(KEY, value),
});

export const { getThemePreference, setThemePreference, subscribeThemePreference } = store;
export type { ThemePreference };
