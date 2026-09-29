import { and, desc, eq, isNull } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { memberships, type Membership, type MembershipFields } from './schema';

/** Действующий абонемент — последний неудалённый */
export async function getMembership(clientId: string): Promise<Membership | null> {
  const rows = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.clientId, clientId), isNull(memberships.deletedAt)))
    .orderBy(desc(memberships.startDate), desc(memberships.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveMembership(id: string, clientId: string, fields: MembershipFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(memberships)
    .values({ endDate: null, notes: null, ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: memberships.id, set: { ...fields, updatedAt: now } });
  notifyChange('memberships');
}

/** Удаление после подтверждения: помечаем строку, а не стираем */
export async function deleteMembership(id: string): Promise<void> {
  const now = Date.now();
  await db.update(memberships).set({ deletedAt: now, updatedAt: now }).where(eq(memberships.id, id));
  notifyChange('memberships');
}
