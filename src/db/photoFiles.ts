import { File } from 'expo-file-system';

import { relativePhotoPath } from '@/lib/photoPaths';

import { newId } from './ids';
import { photoFile, photoFolder } from './photoStorage';

/**
 * Копирует снимок из галереи или камеры в папку приложения.
 * Исходный файл может пропасть (временные файлы камеры), копия — нет.
 * Возвращает относительный путь «photos/<id>.jpg» — его и храним в базе.
 */
export async function storePhoto(sourceUri: string): Promise<string> {
  const fileName = `${newId()}.jpg`;
  await new File(sourceUri).copy(new File(photoFolder(), fileName));
  return relativePhotoPath(fileName);
}

/** Адрес для показа картинки: путь из базы превращаем в полный путь на этом телефоне */
export function resolvePhotoUri(stored: string): string {
  return photoFile(stored)?.uri ?? stored;
}
