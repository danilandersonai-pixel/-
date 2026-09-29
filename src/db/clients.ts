import { eq } from 'drizzle-orm';

import { sortClients } from '@/lib/clients';

import { notifyChange } from './changes';
import { db } from './database';
import { clients, type Client, type ClientFields } from './schema';

/** Все подопечные, кроме архивных, по алфавиту */
export async function listActiveClients(): Promise<Client[]> {
  const rows = await db.select().from(clients).where(eq(clients.archived, false));
  return sortClients(rows);
}

export async function getClient(id: string): Promise<Client | null> {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Создаёт подопечного или обновляет переданные поля, если он уже есть */
export async function saveClient(id: string, fields: ClientFields): Promise<void> {
  const now = Date.now();
  await db
    .insert(clients)
    .values({ ...fields, id, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: clients.id, set: { ...fields, updatedAt: now } });
  notifyChange('clients');
}
