import { and, desc, eq, isNull } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { goals, type Goal, type GoalFields } from './schema';

/** Действующая цель подопечного — последняя неудалённая */
export async function getGoal(clientId: string): Promise<Goal | null> {
  const rows = await db
    .select()
    .from(goals)
    .where(and(eq(goals.clientId, clientId), isNull(goals.deletedAt)))
    .orderBy(desc(goals.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveGoal(id: string, clientId: string, fields: GoalFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(goals)
    .values({ targetDate: null, ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: goals.id, set: { ...fields, updatedAt: now } });
  notifyChange('goals');
}

/** Удаление после подтверждения: помечаем строку, а не стираем */
export async function deleteGoal(id: string): Promise<void> {
  const now = Date.now();
  await db.update(goals).set({ deletedAt: now, updatedAt: now }).where(eq(goals.id, id));
  notifyChange('goals');
}
