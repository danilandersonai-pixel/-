import { and, desc, eq, isNull } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { measurements, type Measurement, type MeasurementFields } from './schema';

/** Замеры подопечного, новые сверху. Удалённые не показываем. */
export async function listMeasurements(clientId: string): Promise<Measurement[]> {
  return db
    .select()
    .from(measurements)
    .where(and(eq(measurements.clientId, clientId), isNull(measurements.deletedAt)))
    .orderBy(desc(measurements.date), desc(measurements.createdAt));
}

/** Все замеры всех подопечных, новые сверху — для динамики в общем списке */
export async function listAllMeasurements(): Promise<Measurement[]> {
  return db
    .select()
    .from(measurements)
    .where(isNull(measurements.deletedAt))
    .orderBy(desc(measurements.date), desc(measurements.createdAt));
}

export async function getMeasurement(id: string): Promise<Measurement | null> {
  const rows = await db
    .select()
    .from(measurements)
    .where(and(eq(measurements.id, id), isNull(measurements.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Создаёт замер или обновляет переданные поля */
export async function saveMeasurement(id: string, clientId: string, fields: MeasurementFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(measurements)
    .values({ ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: measurements.id, set: { ...fields, updatedAt: now } });
  notifyChange('measurements');
}

/** Удаление после подтверждения: помечаем строку, а не стираем её */
export async function deleteMeasurement(id: string): Promise<void> {
  const now = Date.now();
  await db.update(measurements).set({ deletedAt: now, updatedAt: now }).where(eq(measurements.id, id));
  notifyChange('measurements');
}
