import { eq, isNotNull } from 'drizzle-orm';

import { clientFullName } from '@/lib/clients';
import { buildTrash, type TrashItem, type TrashKind } from '@/lib/trash';

import { notifyChange, type TableName } from './changes';
import { db } from './database';
import { clients, goals, measurements, memberships, parqForms, photos, workouts } from './schema';

/** Таблицы, из которых собирается корзина — на их изменения подписан экран корзины */
export const trashTables: readonly TableName[] = ['measurements', 'workouts', 'photos', 'goals', 'memberships', 'parq', 'clients'];

/** Всё удалённое, сначала удалённое последним */
export async function listTrash(): Promise<TrashItem[]> {
  const names = new Map((await db.select().from(clients)).map((c) => [c.id, clientFullName(c)]));
  return buildTrash(
    {
      measurements: await db.select().from(measurements).where(isNotNull(measurements.deletedAt)),
      workouts: await db.select().from(workouts).where(isNotNull(workouts.deletedAt)),
      photos: await db.select().from(photos).where(isNotNull(photos.deletedAt)),
      goals: await db.select().from(goals).where(isNotNull(goals.deletedAt)),
      memberships: await db.select().from(memberships).where(isNotNull(memberships.deletedAt)),
      parq: await db.select().from(parqForms).where(isNotNull(parqForms.deletedAt)),
    },
    names,
  );
}

/** Вернуть запись из корзины: снимаем пометку об удалении */
export async function restoreFromTrash(kind: TrashKind, id: string): Promise<void> {
  const restored = { deletedAt: null, updatedAt: Date.now() };
  switch (kind) {
    case 'measurement':
      await db.update(measurements).set(restored).where(eq(measurements.id, id));
      notifyChange('measurements');
      break;
    case 'workout':
      await db.update(workouts).set(restored).where(eq(workouts.id, id));
      notifyChange('workouts');
      break;
    case 'photo':
      await db.update(photos).set(restored).where(eq(photos.id, id));
      notifyChange('photos');
      break;
    case 'goal':
      await db.update(goals).set(restored).where(eq(goals.id, id));
      notifyChange('goals');
      break;
    case 'membership':
      await db.update(memberships).set(restored).where(eq(memberships.id, id));
      notifyChange('memberships');
      break;
    case 'parq':
      await db.update(parqForms).set(restored).where(eq(parqForms.id, id));
      notifyChange('parq');
      break;
  }
}
