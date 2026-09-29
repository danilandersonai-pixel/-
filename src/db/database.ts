import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

import migrations from './migrations/migrations';
import * as schema from './schema';

const sqlite = openDatabaseSync('sport-tracker.db');

export const db = drizzle(sqlite, { schema });

/** Применяет миграции при запуске. Пока ready = false, экраны с данными не показываем. */
export function useDatabaseReady(): { ready: boolean; error?: Error } {
  const { success, error } = useMigrations(db, migrations);
  return { ready: success, error };
}
