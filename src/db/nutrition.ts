import { desc, eq } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { nutritionPlans, type NutritionFields, type NutritionPlan } from './schema';

/** Планы питания подопечного, новые сверху. Первый — текущий. */
export async function listNutritionPlans(clientId: string): Promise<NutritionPlan[]> {
  return db
    .select()
    .from(nutritionPlans)
    .where(eq(nutritionPlans.clientId, clientId))
    .orderBy(desc(nutritionPlans.startDate), desc(nutritionPlans.createdAt));
}

/** Создаёт план или обновляет переданные поля */
export async function saveNutritionPlan(id: string, clientId: string, fields: NutritionFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(nutritionPlans)
    .values({ ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: nutritionPlans.id, set: { ...fields, updatedAt: now } });
  notifyChange('nutrition');
}
