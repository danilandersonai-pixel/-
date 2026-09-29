// Пути к фото в базе. Новые фото хранятся относительным путём «photos/<id>.jpg» от папки
// документов приложения. На iPhone абсолютный путь к этой папке меняется после обновления
// приложения, поэтому полный путь в базе со временем перестаёт работать.
// Старые записи с полным путём тоже понимаем: берём имя файла и ищем его в папке photos.

export const PHOTO_FOLDER = 'photos';

export function relativePhotoPath(fileName: string): string {
  return `${PHOTO_FOLDER}/${fileName}`;
}

/**
 * Имя файла фото из папки приложения по значению из базы.
 * null — фото хранится иначе (data:-строка в браузерном превью, чужой путь).
 */
export function photoFileName(stored: string): string | null {
  const match = /(?:^|\/)photos\/([^/?#]+)$/.exec(stored);
  if (!match || stored.startsWith('data:')) {
    return null;
  }
  return match[1];
}
