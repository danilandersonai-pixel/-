import { and, asc, eq, isNull } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { newId } from './ids';
import { photos, type Photo, type PhotoAngle } from './schema';

/** Фото подопечного, старые сначала — так проще сравнивать «до» и «после» */
export async function listPhotos(clientId: string): Promise<Photo[]> {
  return db
    .select()
    .from(photos)
    .where(and(eq(photos.clientId, clientId), isNull(photos.deletedAt)))
    .orderBy(asc(photos.date), asc(photos.createdAt));
}

export async function addPhoto(clientId: string, date: string, angle: PhotoAngle, uri: string): Promise<string> {
  const now = Date.now();
  const id = newId();
  await db.insert(photos).values({ id, clientId, date, angle, uri, deletedAt: null, createdAt: now, updatedAt: now });
  notifyChange('photos');
  return id;
}

/** Удаление после подтверждения: помечаем строку, а не стираем */
export async function deletePhoto(id: string): Promise<void> {
  const now = Date.now();
  await db.update(photos).set({ deletedAt: now, updatedAt: now }).where(eq(photos.id, id));
  notifyChange('photos');
}
