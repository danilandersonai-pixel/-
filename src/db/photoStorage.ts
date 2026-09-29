// Папка с фото на телефоне. Только для телефона: в браузерном превью фото хранятся data:-строками.

import { Directory, File, Paths } from 'expo-file-system';

import { PHOTO_FOLDER, photoFileName } from '@/lib/photoPaths';

/** Папка с фото внутри документов приложения (создаётся при первом обращении) */
export function photoFolder(): Directory {
  const folder = new Directory(Paths.document, PHOTO_FOLDER);
  folder.create({ idempotent: true, intermediates: true });
  return folder;
}

/** Файл фото в папке приложения по значению из базы; null — фото хранится не файлом */
export function photoFile(stored: string): File | null {
  const fileName = photoFileName(stored);
  return fileName ? new File(Paths.document, PHOTO_FOLDER, fileName) : null;
}
