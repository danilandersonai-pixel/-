import { Directory, File, Paths } from 'expo-file-system';

import { newId } from './ids';

/**
 * Копирует снимок из галереи или камеры в папку приложения.
 * Исходный файл может пропасть (временные файлы камеры), копия — нет.
 */
export async function storePhoto(sourceUri: string): Promise<string> {
  const folder = new Directory(Paths.document, 'photos');
  folder.create({ idempotent: true, intermediates: true });
  const target = new File(folder, `${newId()}.jpg`);
  await new File(sourceUri).copy(target);
  return target.uri;
}
