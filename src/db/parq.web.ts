// Браузерная версия parq.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { ParqForm, ParqFormFields } from './schema';
import { browserTable } from './webTable';

const table = browserTable<ParqForm>('parq_forms');

const api = {
  async getLatestParq(clientId: string): Promise<ParqForm | null> {
    return (
      table
        .all()
        .filter((f) => f.clientId === clientId && f.deletedAt === null)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)[0] ?? null
    );
  },

  async saveParq(id: string, clientId: string, fields: ParqFormFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      notes: null,
      deletedAt: null,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('parq');
  },

  async deleteParq(id: string): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('parq');
    }
  },
} satisfies typeof import('./parq');

export const { getLatestParq, saveParq, deleteParq } = api;
