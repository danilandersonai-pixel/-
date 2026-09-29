// Браузерная версия consents.ts для превью: те же функции, но данные в localStorage.

import { CONSENT_VERSION } from '@/lib/consent';

import { notifyChange } from './changes';
import { newId } from './ids';
import type { Consent } from './schema';
import { browserTable } from './webTable';

const table = browserTable<Consent>('consents');

const api = {
  async getActiveConsent(clientId: string): Promise<Consent | null> {
    const active = table
      .all()
      .filter((consent) => consent.clientId === clientId && consent.revokedAt === null)
      .sort((a, b) => b.signedAt - a.signedAt);
    return active[0] ?? null;
  },

  async giveConsent(clientId: string, signedBy: string): Promise<void> {
    const now = Date.now();
    table.upsert({
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
  },

  async revokeConsent(consentId: string): Promise<void> {
    const existing = table.get(consentId);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, revokedAt: now, updatedAt: now });
      notifyChange('consents');
    }
  },
} satisfies typeof import('./consents');

export const { getActiveConsent, giveConsent, revokeConsent } = api;
