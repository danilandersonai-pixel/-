// Браузерная версия goals.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { Goal, GoalFields } from './schema';
import { browserTable } from './webTable';

const table = browserTable<Goal>('goals');

const api = {
  async getGoal(clientId: string): Promise<Goal | null> {
    return (
      table
        .all()
        .filter((goal) => goal.clientId === clientId && goal.deletedAt === null)
        .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
    );
  },

  async saveGoal(id: string, clientId: string, fields: GoalFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      targetDate: null,
      deletedAt: null,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('goals');
  },

  async deleteGoal(id: string): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('goals');
    }
  },
} satisfies typeof import('./goals');

export const { getGoal, saveGoal, deleteGoal } = api;
