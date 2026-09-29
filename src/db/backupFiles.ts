// Резервная копия на телефоне: создание ZIP-файла с фото, выбор файла и восстановление.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { BackupError, backupCounts, backupFileName, type BackupCounts, type RestorePlan, type RestoreSummary } from '@/lib/backup';
import { choosePhotoUri, readBackupArchive, writeBackupArchive, type BackupArchive } from '@/lib/backupArchive';
import { relativePhotoPath } from '@/lib/photoPaths';
import { createZipWriter, readZipEntry, ZipError, type RandomAccessSource } from '@/lib/zip';
import { toIsoDate } from '@/utils/date';

import { applyRestorePlan, exportBackup, planBackupRestore } from './backup';
import { photoFile, photoFolder } from './photoStorage';

export type BackupFileSummary = BackupCounts & { missingPhotos: number };

/** Выбранный файл копии, уже прочитанный и проверенный */
export type PickedBackup = BackupArchive & {
  /** Копия файла в папке приложения — из неё читаются фото при восстановлении */
  uri: string;
  fileName: string;
};

function freshCacheFile(fileName: string): File {
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  return file;
}

/** Создаёт ZIP-копию и открывает меню «Поделиться». Возвращает, что вошло в копию. */
export async function shareBackupFile(): Promise<BackupFileSummary> {
  const data = await exportBackup();
  const fileName = backupFileName(toIsoDate(new Date()));
  const file = freshCacheFile(fileName);
  file.create();
  const handle = file.open();
  let missingPhotos = 0;
  try {
    const writer = createZipWriter((chunk) => handle.writeBytes(chunk));
    ({ missingPhotos } = await writeBackupArchive(writer, data, async (row) => {
      const source = photoFile(row.uri as string);
      return source?.exists ? source.bytes() : null;
    }));
  } finally {
    handle.close();
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/zip', UTI: 'public.zip-archive', dialogTitle: fileName });
  return { ...backupCounts(data), missingPhotos };
}

/** Открытый файл как источник для чтения по смещению */
function openSource(uri: string): { source: RandomAccessSource; close: () => void } {
  const file = new File(uri);
  const handle = file.open();
  return {
    source: {
      size: file.size,
      read: (offset, length) => {
        handle.offset = offset;
        return handle.readBytes(length);
      },
    },
    close: () => handle.close(),
  };
}

/**
 * Системный выбор файла. null — тренер передумал.
 * Файл сначала копируется в папку приложения: так его можно читать частями, откуда бы он ни пришёл.
 * Бросает BackupError, если это не копия или она повреждена.
 */
export async function pickBackupFile(): Promise<PickedBackup | null> {
  const picked = await File.pickFileAsync();
  if (picked.canceled) {
    return null;
  }
  const local = freshCacheFile('restore-source');
  try {
    await picked.result.copy(local);
  } catch {
    // Некоторые источники на Android не отдают файл копированием — читаем целиком
    local.create();
    local.write(await picked.result.bytes());
  }
  const { source, close } = openSource(local.uri);
  try {
    return { ...readBackupArchive(source), uri: local.uri, fileName: picked.result.name };
  } finally {
    close();
  }
}

const photoFiles = {
  exists: (uri: string) => photoFile(uri)?.exists ?? false,
  restoredUri: (photoId: string) => relativePhotoPath(`${photoId}.jpg`),
};

/** Что изменится при восстановлении — для экрана подтверждения */
export async function previewRestore(picked: PickedBackup): Promise<RestorePlan> {
  return planBackupRestore(picked.data, choosePhotoUri(picked, photoFiles));
}

/**
 * Восстанавливает копию: сначала достаёт нужные фото, потом записывает данные.
 * Если файл повреждён, ошибка случится до записи в базу — данные на телефоне не тронуты.
 */
export async function restoreBackup(picked: PickedBackup): Promise<RestoreSummary> {
  const plan = await previewRestore(picked);
  const { source, close } = openSource(picked.uri);
  try {
    photoFolder();
    for (const action of plan.actions) {
      const id = action.row.id as string;
      const entry = picked.photoEntries.get(id);
      if (action.table !== 'photos' || !entry || action.row.uri !== photoFiles.restoredUri(id)) {
        continue;
      }
      const target = photoFile(action.row.uri);
      if (target && !target.exists) {
        const bytes = readZipEntry(source, entry);
        target.create();
        target.write(bytes);
      }
    }
  } catch (error) {
    throw error instanceof ZipError ? new BackupError('damaged') : error;
  } finally {
    close();
  }
  await applyRestorePlan(plan);
  return plan.summary;
}
