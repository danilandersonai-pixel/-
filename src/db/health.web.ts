// Браузерная версия health.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import { newId } from './ids';
import type { Health, HealthFields } from './schema';
import { browserTable } from './webTable';

const table = browserTable<Health>('health');

function findByClient(clientId: string): Health | null {
  return table.all().find((row) => row.clientId === clientId) ?? null;
}

const api = {
  async getHealth(clientId: string): Promise<Health | null> {
    return findByClient(clientId);
  },

  async saveHealth(clientId: string, fields: HealthFields): Promise<void> {
    const now = Date.now();
    const existing = findByClient(clientId);
    table.upsert({
      contraindications: null,
      injuries: null,
      limitations: null,
      notes: null,
      ...existing,
      ...fields,
      id: existing?.id ?? newId(),
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('health');
  },
} satisfies typeof import('./health');

export const { getHealth, saveHealth } = api;
