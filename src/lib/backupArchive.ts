// Файл резервной копии: ZIP (backup.json + photos/<id>.jpg) или старая копия — просто JSON.
// Здесь только работа с байтами, без файловой системы — одинаково для телефона, браузера и тестов.

import {
  BACKUP_DATA_FILE,
  backupPhotoEntry,
  BackupError,
  parseBackupJson,
  photoIdFromEntry,
  type BackupData,
  type BackupRow,
  type RestoreInput,
} from './backup';
import { looksLikeZip, readZipEntries, readZipEntry, ZipError, type RandomAccessSource, type ZipEntry, type ZipWriter } from './zip';

export type BackupArchive = {
  data: BackupData;
  /** Файлы фото в копии по id фото. У старой копии (JSON) их нет. */
  photoEntries: Map<string, ZipEntry>;
};

/** Читает копию любого формата. Бросает BackupError с причиной, понятной тренеру. */
export function readBackupArchive(source: RandomAccessSource): BackupArchive {
  if (source.size === 0) {
    throw new BackupError('notBackup');
  }
  const head = source.read(0, 4);
  if (!looksLikeZip(head)) {
    // Старая копия (версия 1) — JSON-файл. Всё остальное parseBackupJson отклонит сам.
    const text = new TextDecoder().decode(source.read(0, source.size));
    if (!text.trimStart().startsWith('{')) {
      throw new BackupError('notBackup');
    }
    return { data: parseBackupJson(text), photoEntries: new Map() };
  }
  try {
    const entries = readZipEntries(source);
    const dataEntry = entries.find((entry) => entry.name === BACKUP_DATA_FILE);
    if (!dataEntry) {
      throw new BackupError('notBackup');
    }
    const data = parseBackupJson(new TextDecoder().decode(readZipEntry(source, dataEntry)));
    const photoEntries = new Map<string, ZipEntry>();
    for (const entry of entries) {
      const id = photoIdFromEntry(entry.name);
      if (id) {
        photoEntries.set(id, entry);
      }
    }
    return { data, photoEntries };
  } catch (error) {
    throw error instanceof ZipError ? new BackupError('damaged') : error;
  }
}

/** Записывает копию в архив. photoBytes вызывается по одному фото — в памяти не больше одного снимка. */
export async function writeBackupArchive(
  writer: ZipWriter,
  data: BackupData,
  photoBytes: (row: BackupRow) => Promise<Uint8Array | null>,
): Promise<{ photos: number; missingPhotos: number }> {
  writer.addFile(BACKUP_DATA_FILE, new TextEncoder().encode(JSON.stringify(data, null, 2)));
  let photos = 0;
  let missingPhotos = 0;
  for (const row of data.tables.photos) {
    const alive = row.deletedAt === null || row.deletedAt === undefined;
    const uri = typeof row.uri === 'string' ? row.uri : '';
    // Фото-строка data: уже лежит внутри backup.json
    if (!alive || uri.startsWith('data:')) {
      continue;
    }
    const bytes = await photoBytes(row);
    if (bytes) {
      writer.addFile(backupPhotoEntry(row.id as string), bytes);
      photos += 1;
    } else {
      missingPhotos += 1;
    }
  }
  writer.finish();
  return { photos, missingPhotos };
}

export type PhotoFileAccess = {
  /** Есть ли на этом телефоне файл по пути из базы */
  exists(uri: string): boolean;
  /** Путь, по которому фото из копии будет сохранено на телефоне */
  restoredUri(photoId: string): string;
};

/**
 * Какой путь фото записать в базу при восстановлении:
 * фото уже есть на телефоне — оставляем его; есть в копии — берём из копии;
 * старая копия на том же телефоне — файл на месте; иначе фото нет (null).
 */
export function choosePhotoUri(archive: BackupArchive, files: PhotoFileAccess): RestoreInput['photoUri'] {
  const usable = (uri: unknown): uri is string => typeof uri === 'string' && (uri.startsWith('data:') || files.exists(uri));
  return (row, existing) => {
    if (existing && usable(existing.uri)) {
      return existing.uri;
    }
    if (archive.photoEntries.has(row.id as string)) {
      return files.restoredUri(row.id as string);
    }
    return usable(row.uri) ? row.uri : null;
  };
}
