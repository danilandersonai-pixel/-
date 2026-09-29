// Хранилище настроек телефона (тема, профиль тренера и т. п.) — expo-sqlite/kv-store.
// Это не данные подопечных: они живут в основной базе и попадают в резервную копию.

import Storage from 'expo-sqlite/kv-store';

import type { SettingBackend } from '@/lib/settingStore';

export const kv: SettingBackend = {
  read: (key) => Storage.getItemSync(key),
  write: (key, value) => Storage.setItemSync(key, value),
};
