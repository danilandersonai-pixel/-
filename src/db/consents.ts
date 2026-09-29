import { and, desc, eq, isNull } from 'drizzle-orm';

import { CONSENT_VERSION } from '@/lib/consent';

import { notifyChange } from './changes';
import { db } from './database';
import { newId } from './ids';
import { consents, type Consent } from './schema';

/** Действующее согласие подопечного или null */
export async function getActiveConsent(clientId: string): Promise<Consent | null> {
  const rows = await db
    .select()
    .from(consents)
    .where(and(eq(consents.clientId, clientId), isNull(consents.revokedAt)))
    .orderBy(desc(consents.signedAt))
    .limit(1);
  return rows[0] ?? null;
}

/** Записывает согласие с текущей версией текста */
export async function giveConsent(clientId: string, signedBy: string): Promise<void> {
  const now = Date.now();
  await db.insert(consents).values({
    id: newId(),
    clientId,
    signedAt: now,
    textVersion: CONSENT_VERSION,
    signedBy,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  notifyChange('consents');
}

/** Отзыв согласия: запись остаётся в истории с датой отзыва */
export async function revokeConsent(consentId: string): Promise<void> {
  const now = Date.now();
  await db.update(consents).set({ revokedAt: now, updatedAt: now }).where(eq(consents.id, consentId));
  notifyChange('consents');
}
