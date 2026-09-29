// Резервная копия: все таблицы в одном JSON-файле. Фото не входят — это файлы на телефоне.

export const BACKUP_FORMAT_VERSION = 1;

export const backupTables = [
  'clients',
  'consents',
  'health',
  'measurements',
  'photos',
  'workouts',
  'workout_exercises',
  'sets',
  'nutrition_plans',
] as const;

export type BackupTable = (typeof backupTables)[number];

export type BackupData = {
  app: 'sport-tracker';
  version: number;
  exportedAt: string;
  tables: Record<BackupTable, Record<string, unknown>[]>;
};

export function makeBackup(tables: Record<BackupTable, Record<string, unknown>[]>, now: Date): BackupData {
  return { app: 'sport-tracker', version: BACKUP_FORMAT_VERSION, exportedAt: now.toISOString(), tables };
}

/** Имя файла: «sport-tracker-backup-2026-09-29.json» */
export function backupFileName(todayIso: string): string {
  return `sport-tracker-backup-${todayIso}.json`;
}

/** Сколько записей основных видов в копии — чтобы тренер видел, что сохраняет */
export function backupCounts(data: BackupData): { clients: number; measurements: number; workouts: number } {
  const alive = (rows: Record<string, unknown>[]) => rows.filter((row) => row.deletedAt === null || row.deletedAt === undefined).length;
  return {
    clients: data.tables.clients.length,
    measurements: alive(data.tables.measurements),
    workouts: alive(data.tables.workouts),
  };
}
