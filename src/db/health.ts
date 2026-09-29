import { eq } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { newId } from './ids';
import { health, type Health, type HealthFields } from './schema';

export async function getHealth(clientId: string): Promise<Health | null> {
  const rows = await db.select().from(health).where(eq(health.clientId, clientId)).limit(1);
  return rows[0] ?? null;
}

/** Создаёт запись о здоровье или обновляет переданные поля */
export async function saveHealth(clientId: string, fields: HealthFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(health)
    .values({ ...fields, id: newId(), clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: health.clientId, set: { ...fields, updatedAt: now } });
  notifyChange('health');
}
