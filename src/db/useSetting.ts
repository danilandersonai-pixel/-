import { useSyncExternalStore } from 'react';

import type { Setting } from '@/lib/settingStore';

/** Значение настройки телефона; экран перерисуется, когда её изменят */
export function useSetting<T>(setting: Setting<T>): T {
  return useSyncExternalStore(setting.subscribe, setting.get);
}
