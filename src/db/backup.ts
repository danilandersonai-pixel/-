import { getTableColumns, inArray } from 'drizzle-orm';

import {
  makeBackup,
  planRestore,
  type BackupData,
  type BackupRow,
  type BackupTable,
  type RestoreInput,
  type RestorePlan,
} from '@/lib/backup';

import { notifyChange } from './changes';
import { db } from './database';
import { clients, consents, health, measurements, nutritionPlans, photos, sets, workoutExercises, workouts } from './schema';

const tables = {
  clients,
  consents,
  health,
  measurements,
  photos,
  workouts,
  workout_exercises: workoutExercises,
  sets,
  nutrition_plans: nutritionPlans,
} as const;

async function readAllTables(): Promise<Record<BackupTable, BackupRow[]>> {
  return {
    clients: await db.select().from(clients),
    consents: await db.select().from(consents),
    health: await db.select().from(health),
    measurements: await db.select().from(measurements),
    photos: await db.select().from(photos),
    workouts: await db.select().from(workouts),
    workout_exercises: await db.select().from(workoutExercises),
    sets: await db.select().from(sets),
    nutrition_plans: await db.select().from(nutritionPlans),
  };
}

/** Все данные приложения для резервной копии */
export async function exportBackup(): Promise<BackupData> {
  return makeBackup(await readAllTables(), new Date());
}

/** Что изменится, если восстановить копию. Ничего не записывает. */
export async function planBackupRestore(backup: BackupData, photoUri: RestoreInput['photoUri']): Promise<RestorePlan> {
  return planRestore({ current: await readAllTables(), backup, photoUri });
}

// Строки разных таблиц приходят из копии как объекты без типа. planRestore уже проверил
// обязательные поля, а лишние ключи отбрасываем ниже. TypeScript не умеет связать имя таблицы
// с типом её строки в общем цикле, поэтому запись идёт через тип одной таблицы.
type AnyTable = typeof clients;

function onlyColumns(table: AnyTable, row: BackupRow): AnyTable['$inferInsert'] {
  const columns = Object.keys(getTableColumns(table));
  return Object.fromEntries(columns.filter((key) => key in row).map((key) => [key, row[key]])) as AnyTable['$inferInsert'];
}

/** SQLite ограничивает число параметров в запросе — удаляем пачками */
function chunks<T>(items: T[], size = 400): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Записывает план восстановления. Каждая запись — «вставить или заменить», поэтому, если запись
 * прервётся посередине, восстановление можно просто запустить ещё раз: уже записанное пропустится.
 */
export async function applyRestorePlan(plan: RestorePlan): Promise<void> {
  for (const action of plan.actions) {
    const table = tables[action.table] as unknown as AnyTable;
    const values = onlyColumns(table, action.row);
    await db.insert(table).values(values).onConflictDoUpdate({ target: table.id, set: values });
  }
  for (const ids of chunks(plan.staleSetIds)) {
    await db.delete(sets).where(inArray(sets.id, ids));
  }
  for (const ids of chunks(plan.staleExerciseIds)) {
    await db.delete(workoutExercises).where(inArray(workoutExercises.id, ids));
  }
  for (const table of ['clients', 'consents', 'health', 'measurements', 'photos', 'workouts', 'nutrition'] as const) {
    notifyChange(table);
  }
}
