// Браузерная версия nutrition.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { NutritionFields, NutritionPlan } from './schema';
import { createWebTable, getBrowserStorage } from './webTable';

const table = createWebTable<NutritionPlan>('nutrition_plans', getBrowserStorage());

const api = {
  async listNutritionPlans(clientId: string): Promise<NutritionPlan[]> {
    return table
      .all()
      .filter((plan) => plan.clientId === clientId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate) || b.createdAt - a.createdAt);
  },

  async saveNutritionPlan(id: string, clientId: string, fields: NutritionFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      calories: null,
      protein: null,
      fat: null,
      carbs: null,
      notes: null,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('nutrition');
  },
} satisfies typeof import('./nutrition');

export const { listNutritionPlans, saveNutritionPlan } = api;
