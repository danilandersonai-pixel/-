import { and, desc, eq, isNull } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { parqForms, type ParqForm, type ParqFormFields } from './schema';

/** Последняя анкета подопечного — по дате заполнения */
export async function getLatestParq(clientId: string): Promise<ParqForm | null> {
  const rows = await db
    .select()
    .from(parqForms)
    .where(and(eq(parqForms.clientId, clientId), isNull(parqForms.deletedAt)))
    .orderBy(desc(parqForms.date), desc(parqForms.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveParq(id: string, clientId: string, fields: ParqFormFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(parqForms)
    .values({ notes: null, ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: parqForms.id, set: { ...fields, updatedAt: now } });
  notifyChange('parq');
}

/** Удаление после подтверждения: помечаем строку, а не стираем */
export async function deleteParq(id: string): Promise<void> {
  const now = Date.now();
  await db.update(parqForms).set({ deletedAt: now, updatedAt: now }).where(eq(parqForms.id, id));
  notifyChange('parq');
}
