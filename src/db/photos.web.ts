// Браузерная версия photos.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import { newId } from './ids';
import type { Photo, PhotoAngle } from './schema';
import { createWebTable, getBrowserStorage } from './webTable';

const table = createWebTable<Photo>('photos', getBrowserStorage());

const api = {
  async listPhotos(clientId: string): Promise<Photo[]> {
    return table
      .all()
      .filter((photo) => photo.clientId === clientId && photo.deletedAt === null)
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  },

  async addPhoto(clientId: string, date: string, angle: PhotoAngle, uri: string): Promise<string> {
    const now = Date.now();
    const id = newId();
    table.upsert({ id, clientId, date, angle, uri, deletedAt: null, createdAt: now, updatedAt: now });
    notifyChange('photos');
    return id;
  },

  async deletePhoto(id: string): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('photos');
    }
  },
} satisfies typeof import('./photos');

export const { listPhotos, addPhoto, deletePhoto } = api;
