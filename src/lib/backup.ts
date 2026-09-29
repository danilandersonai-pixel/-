// Резервная копия: ZIP-файл, внутри backup.json со всеми таблицами и папка photos с фото.
// Восстановление — слияние: ничего не удаляется, из копии добавляется то, чего нет на телефоне,
// а запись, которая есть и там и там, берётся более новая (по updatedAt).

/**
 * Версия формата копии.
 * 1 — JSON-файл без фото; 2 — ZIP: тот же JSON + файлы фото. Таблицы в обеих версиях одинаковые.
 */
export const BACKUP_FORMAT_VERSION = 2;

export const BACKUP_DATA_FILE = 'backup.json';

/** Таблицы в порядке восстановления: сначала те, на которые ссылаются другие */
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
  'goals',
  'memberships',
  'parq_forms',
] as const;

export type BackupTable = (typeof backupTables)[number];

export type BackupRow = Record<string, unknown>;

export type BackupData = {
  app: 'sport-tracker';
  version: number;
  exportedAt: string;
  tables: Record<BackupTable, BackupRow[]>;
};

export function makeBackup(tables: Record<BackupTable, BackupRow[]>, now: Date): BackupData {
  return { app: 'sport-tracker', version: BACKUP_FORMAT_VERSION, exportedAt: now.toISOString(), tables };
}

/** Имя файла: «sport-tracker-backup-2026-09-29.zip» */
export function backupFileName(todayIso: string): string {
  return `sport-tracker-backup-${todayIso}.zip`;
}

/** Путь фото внутри архива */
export function backupPhotoEntry(photoId: string): string {
  return `photos/${photoId}.jpg`;
}

/** id фото по пути внутри архива; null — это не фото */
export function photoIdFromEntry(name: string): string | null {
  return /^photos\/([^/]+)\.jpg$/.exec(name)?.[1] ?? null;
}

const isAlive = (row: BackupRow) => row.deletedAt === null || row.deletedAt === undefined;

export type BackupCounts = { clients: number; measurements: number; workouts: number; photos: number };

/** Сколько записей основных видов в копии — чтобы тренер видел, что сохраняет */
export function backupCounts(data: BackupData): BackupCounts {
  return {
    clients: data.tables.clients.length,
    measurements: data.tables.measurements.filter(isAlive).length,
    workouts: data.tables.workouts.filter(isAlive).length,
    photos: data.tables.photos.filter(isAlive).length,
  };
}

// ---------- Чтение копии ----------

export type BackupProblem = 'notBackup' | 'newerVersion' | 'damaged';

export class BackupError extends Error {
  constructor(readonly problem: BackupProblem) {
    super(problem);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Разбирает backup.json (или старую копию .json). Бросает BackupError с причиной для экрана. */
export function parseBackupJson(text: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    throw new BackupError('damaged');
  }
  if (!isObject(parsed) || parsed.app !== 'sport-tracker') {
    throw new BackupError('notBackup');
  }
  if (typeof parsed.version !== 'number' || !isObject(parsed.tables)) {
    throw new BackupError('damaged');
  }
  if (parsed.version > BACKUP_FORMAT_VERSION) {
    throw new BackupError('newerVersion');
  }
  const source = parsed.tables;
  const tables = Object.fromEntries(
    backupTables.map((name) => {
      const rows = source[name];
      return [name, Array.isArray(rows) ? rows.filter(isObject) : []];
    }),
  ) as Record<BackupTable, BackupRow[]>;
  return {
    app: 'sport-tracker',
    version: parsed.version,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
    tables,
  };
}

// ---------- План восстановления ----------

type FieldType = 'string' | 'number';

/** Обязательные поля каждой таблицы (кроме id, createdAt, updatedAt — они обязательны везде) */
const requiredFields: Record<BackupTable, Record<string, FieldType>> = {
  clients: { firstName: 'string' },
  consents: { clientId: 'string', signedAt: 'number', textVersion: 'string', signedBy: 'string' },
  health: { clientId: 'string' },
  measurements: { clientId: 'string', date: 'string', weight: 'number' },
  photos: { clientId: 'string', date: 'string', angle: 'string', uri: 'string' },
  workouts: { clientId: 'string', date: 'string', status: 'string' },
  workout_exercises: { workoutId: 'string', position: 'number', name: 'string' },
  sets: { exerciseId: 'string', position: 'number' },
  nutrition_plans: { clientId: 'string', startDate: 'string' },
  goals: { clientId: 'string', metric: 'string', targetValue: 'number', startDate: 'string' },
  memberships: { clientId: 'string', total: 'number', startDate: 'string' },
  parq_forms: { clientId: 'string', date: 'string', version: 'string', answers: 'string' },
};

const allowedValues: Partial<Record<BackupTable, Record<string, readonly (string | null)[]>>> = {
  clients: { gender: ['male', 'female', null] },
  photos: { angle: ['front', 'side', 'back'] },
  workouts: { status: ['planned', 'done'] },
  goals: { metric: ['weight', 'bodyFat', 'fatMass', 'leanMass', 'waist', 'hips'] },
};

function isValidRow(table: BackupTable, row: BackupRow): boolean {
  if (typeof row.id !== 'string' || row.id === '' || typeof row.createdAt !== 'number' || typeof row.updatedAt !== 'number') {
    return false;
  }
  for (const [field, type] of Object.entries(requiredFields[table])) {
    if (typeof row[field] !== type) {
      return false;
    }
  }
  for (const [field, values] of Object.entries(allowedValues[table] ?? {})) {
    if (field in row && !values.includes(row[field] as string | null)) {
      return false;
    }
  }
  return true;
}

export type RestoreAction = { table: BackupTable; mode: 'insert' | 'update'; row: BackupRow };

export type RestoreSummary = {
  added: BackupCounts;
  /** Записей, которые заменены более новыми из копии */
  updated: number;
  /** Записей, которые уже есть на телефоне в той же или более новой версии */
  unchanged: number;
  /** Повреждённые записи и записи без подопечного или тренировки */
  skipped: number;
  /** Фото, у которых нет файла ни в копии, ни на телефоне */
  missingPhotos: number;
};

export type RestorePlan = {
  /** Действия в безопасном порядке: сначала подопечные, потом всё, что к ним относится */
  actions: RestoreAction[];
  /** Упражнения и подходы тренировок, взятых из копии, которых в копии уже нет */
  staleExerciseIds: string[];
  staleSetIds: string[];
  summary: RestoreSummary;
};

export type RestoreInput = {
  current: Record<BackupTable, BackupRow[]>;
  backup: BackupData;
  /**
   * Путь к файлу фото, который сохранить в базе, или null, если файла нет ни в копии, ни на телефоне.
   * Решает слой работы с файлами: он знает, что лежит в архиве и в папке приложения.
   * existing — эта же запись на телефоне, если она есть.
   */
  photoUri: (row: BackupRow, existing: BackupRow | undefined) => string | null;
};

const parentOf: Partial<Record<BackupTable, { field: string; table: BackupTable }>> = {
  consents: { field: 'clientId', table: 'clients' },
  health: { field: 'clientId', table: 'clients' },
  measurements: { field: 'clientId', table: 'clients' },
  photos: { field: 'clientId', table: 'clients' },
  workouts: { field: 'clientId', table: 'clients' },
  nutrition_plans: { field: 'clientId', table: 'clients' },
  goals: { field: 'clientId', table: 'clients' },
  memberships: { field: 'clientId', table: 'clients' },
  parq_forms: { field: 'clientId', table: 'clients' },
};

function byId(rows: BackupRow[]): Map<string, BackupRow> {
  return new Map(rows.filter((row) => typeof row.id === 'string').map((row) => [row.id as string, row]));
}

const newer = (incoming: BackupRow, local: BackupRow) => (incoming.updatedAt as number) > (local.updatedAt as number);

export function planRestore({ current, backup, photoUri }: RestoreInput): RestorePlan {
  const actions: RestoreAction[] = [];
  const summary: RestoreSummary = {
    added: { clients: 0, measurements: 0, workouts: 0, photos: 0 },
    updated: 0,
    unchanged: 0,
    skipped: 0,
    missingPhotos: 0,
  };
  const local = Object.fromEntries(backupTables.map((name) => [name, byId(current[name])])) as Record<
    BackupTable,
    Map<string, BackupRow>
  >;
  const incoming = Object.fromEntries(
    backupTables.map((name) => {
      const valid = backup.tables[name].filter((row) => isValidRow(name, row));
      summary.skipped += backup.tables[name].length - valid.length;
      return [name, byId(valid)];
    }),
  ) as Record<BackupTable, Map<string, BackupRow>>;

  const exists = (table: BackupTable, id: unknown) =>
    typeof id === 'string' && (incoming[table].has(id) || local[table].has(id));

  const add = (table: BackupTable, mode: RestoreAction['mode'], row: BackupRow) => {
    actions.push({ table, mode, row });
    if (mode === 'update') {
      summary.updated += 1;
    } else if ((table === 'clients' || table === 'measurements' || table === 'workouts' || table === 'photos') && isAlive(row)) {
      // Удалённые записи тоже переносятся (для будущей синхронизации), но в итогах их не показываем
      summary.added[table] += 1;
    }
  };

  /** Обычная запись: новая — добавить, есть — взять более новую версию */
  const merge = (table: BackupTable, row: BackupRow, existing: BackupRow | undefined) => {
    if (!existing) {
      add(table, 'insert', row);
    } else if (newer(row, existing)) {
      add(table, 'update', row);
    } else {
      summary.unchanged += 1;
    }
  };

  const localHealthByClient = new Map([...local.health.values()].map((row) => [row.clientId, row]));
  const workoutWins = new Set<string>();
  const staleExerciseIds: string[] = [];
  const staleSetIds: string[] = [];

  for (const table of backupTables) {
    if (table === 'workout_exercises' || table === 'sets') {
      continue; // идут вместе со своей тренировкой, см. ниже
    }
    const parent = parentOf[table];
    for (const row of incoming[table].values()) {
      if (parent && !exists(parent.table, row[parent.field])) {
        summary.skipped += 1;
        continue;
      }
      const existing = local[table].get(row.id as string);

      if (table === 'health' && !existing) {
        // Здоровье — одна запись на подопечного: сравниваем с записью этого подопечного
        const sameClient = localHealthByClient.get(row.clientId);
        if (sameClient) {
          merge(table, { ...row, id: sameClient.id }, sameClient);
          continue;
        }
      }

      if (table === 'photos') {
        const uri = photoUri(row, existing);
        if (uri === null && !existing && isAlive(row)) {
          summary.missingPhotos += 1;
          continue;
        }
        merge(table, { ...row, uri: uri ?? existing?.uri ?? row.uri }, existing);
        continue;
      }

      if (table === 'workouts') {
        const before = actions.length;
        merge(table, row, existing);
        if (actions.length > before) {
          workoutWins.add(row.id as string);
        }
        continue;
      }

      merge(table, row, existing);
    }
  }

  // Упражнения и подходы: у тренировки, взятой из копии, они тоже берутся из копии целиком
  const incomingExercises = [...incoming.workout_exercises.values()];
  const incomingSets = [...incoming.sets.values()];
  for (const exercise of incomingExercises) {
    if (!exists('workouts', exercise.workoutId)) {
      summary.skipped += 1;
    } else if (!workoutWins.has(exercise.workoutId as string)) {
      summary.unchanged += 1;
    } else {
      add('workout_exercises', local.workout_exercises.has(exercise.id as string) ? 'update' : 'insert', exercise);
    }
  }
  const exerciseWorkout = new Map(
    [...local.workout_exercises.values(), ...incomingExercises].map((exercise) => [exercise.id, exercise.workoutId]),
  );
  for (const set of incomingSets) {
    const workoutId = exerciseWorkout.get(set.exerciseId);
    if (!incoming.workout_exercises.has(set.exerciseId as string)) {
      summary.skipped += 1;
    } else if (!workoutWins.has(workoutId as string)) {
      summary.unchanged += 1;
    } else {
      add('sets', local.sets.has(set.id as string) ? 'update' : 'insert', set);
    }
  }
  for (const exercise of local.workout_exercises.values()) {
    if (workoutWins.has(exercise.workoutId as string) && !incoming.workout_exercises.has(exercise.id as string)) {
      staleExerciseIds.push(exercise.id as string);
    }
  }
  for (const set of local.sets.values()) {
    if (workoutWins.has(exerciseWorkout.get(set.exerciseId) as string) && !incoming.sets.has(set.id as string)) {
      staleSetIds.push(set.id as string);
    }
  }

  return { actions, staleExerciseIds, staleSetIds, summary };
}

/** Есть ли что восстанавливать */
export function planHasChanges(plan: RestorePlan): boolean {
  return plan.actions.length > 0 || plan.staleExerciseIds.length > 0 || plan.staleSetIds.length > 0;
}
