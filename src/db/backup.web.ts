// Браузерная версия backup.ts для превью: те же функции над таблицами в localStorage.

import {
  backupTables,
  makeBackup,
  planRestore,
  type BackupData,
  type BackupRow,
  type BackupTable,
  type RestoreInput,
  type RestorePlan,
} from '@/lib/backup';

import { notifyChange } from './changes';
import { browserTable } from './webTable';

const table = (name: BackupTable) => browserTable<{ id: string }>(name);

function readAllTables(): Record<BackupTable, BackupRow[]> {
  return Object.fromEntries(backupTables.map((name) => [name, table(name).all() as BackupRow[]])) as Record<BackupTable, BackupRow[]>;
}

const api = {
  async exportBackup(): Promise<BackupData> {
    return makeBackup(readAllTables(), new Date());
  },

  async planBackupRestore(backup: BackupData, photoUri: RestoreInput['photoUri']): Promise<RestorePlan> {
    return planRestore({ current: readAllTables(), backup, photoUri });
  },

  async applyRestorePlan(plan: RestorePlan): Promise<void> {
    for (const action of plan.actions) {
      const existing = table(action.table).get(action.row.id as string);
      // Строка уже проверена planRestore: id — строка, обязательные поля на месте
      table(action.table).upsert({ ...existing, ...action.row } as { id: string });
    }
    plan.staleSetIds.forEach((id) => table('sets').remove(id));
    plan.staleExerciseIds.forEach((id) => table('workout_exercises').remove(id));
    for (const name of ['clients', 'consents', 'health', 'measurements', 'photos', 'workouts', 'nutrition'] as const) {
      notifyChange(name);
    }
  },
} satisfies typeof import('./backup');

export const { exportBackup, planBackupRestore, applyRestorePlan } = api;
