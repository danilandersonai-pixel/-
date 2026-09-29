// Браузерная версия backup.ts для превью: читает те же таблицы из localStorage.

import { backupTables, makeBackup, type BackupData, type BackupTable } from '@/lib/backup';

import { createWebTable, getBrowserStorage } from './webTable';

const api = {
  async exportBackup(): Promise<BackupData> {
    const storage = getBrowserStorage();
    const tables = Object.fromEntries(
      backupTables.map((name) => [name, createWebTable<{ id: string }>(name, storage).all()]),
    ) as unknown as Record<BackupTable, Record<string, unknown>[]>;
    return makeBackup(tables, new Date());
  },
} satisfies typeof import('./backup');

export const { exportBackup } = api;
