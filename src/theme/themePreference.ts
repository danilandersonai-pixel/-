// Выбор темы тренером: «авто», всегда тёмная или всегда светлая. Хранится на телефоне.

import { kv } from '@/db/kv';
import { createSetting } from '@/lib/settingStore';

import { parseThemePreference, type ThemePreference } from './themePreferenceStore';

const setting = createSetting(kv, 'themePreference', parseThemePreference);

export const getThemePreference = setting.get;
export const setThemePreference = setting.set;
export const subscribeThemePreference = setting.subscribe;
export type { ThemePreference };
