// Браузерная версия memberships.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { Membership, MembershipFields } from './schema';
import { browserTable } from './webTable';

const table = browserTable<Membership>('memberships');

const api = {
  async getMembership(clientId: string): Promise<Membership | null> {
    return (
      table
        .all()
        .filter((m) => m.clientId === clientId && m.deletedAt === null)
        .sort((a, b) => b.startDate.localeCompare(a.startDate) || b.createdAt - a.createdAt)[0] ?? null
    );
  },

  async saveMembership(id: string, clientId: string, fields: MembershipFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      endDate: null,
      notes: null,
      deletedAt: null,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('memberships');
  },

  async deleteMembership(id: string): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('memberships');
    }
  },
} satisfies typeof import('./memberships');

export const { getMembership, saveMembership, deleteMembership } = api;
