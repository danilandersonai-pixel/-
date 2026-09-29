// Браузерная версия kv.ts для превью: настройки в localStorage.

import type { SettingBackend } from '@/lib/settingStore';

import { getBrowserStorage } from './webTable';

const PREFIX = 'sport-tracker:';

const api = {
  kv: {
    read: (key) => getBrowserStorage()?.getItem(PREFIX + key) ?? null,
    write: (key, value) => getBrowserStorage()?.setItem(PREFIX + key, value),
  } satisfies SettingBackend,
} satisfies typeof import('./kv');

export const { kv } = api;
