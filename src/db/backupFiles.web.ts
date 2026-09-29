// Браузерная версия backupFiles.ts для превью. Сохранить файл в артефакте нельзя (скачивание
// запрещено), поэтому «сохранение» только считает, что вошло бы в копию. Выбрать файл копии,
// сделанной на телефоне, можно: фото из неё превращаются в data:-строки, как все фото превью.

import { backupCounts, type RestorePlan, type RestoreSummary } from '@/lib/backup';
import { choosePhotoUri, readBackupArchive } from '@/lib/backupArchive';
import { bytesSource, readZipEntry } from '@/lib/zip';

import { applyRestorePlan, exportBackup, planBackupRestore } from './backup';
import type { BackupFileSummary, PickedBackup } from './backupFiles';

/** Байты выбранных файлов: в браузере нет папки приложения, держим в памяти до перезагрузки */
const pickedFiles = new Map<string, Uint8Array>();

function chooseFile(): Promise<globalThis.File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.json,application/zip,application/json';
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null));
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function photoAccess(picked: PickedBackup, withData: boolean) {
  const bytes = pickedFiles.get(picked.uri);
  return {
    // В превью все фото — data:-строки, других файлов нет
    exists: () => false,
    restoredUri: (photoId: string) => {
      const entry = picked.photoEntries.get(photoId);
      if (!withData || !entry || !bytes) {
        return `data:image/jpeg;base64,`;
      }
      return `data:image/jpeg;base64,${toBase64(readZipEntry(bytesSource(bytes), entry))}`;
    },
  };
}

const api = {
  async shareBackupFile(): Promise<BackupFileSummary> {
    return { ...backupCounts(await exportBackup()), missingPhotos: 0 };
  },

  async pickBackupFile(): Promise<PickedBackup | null> {
    const file = await chooseFile();
    if (!file) {
      return null;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uri = `picked:${pickedFiles.size + 1}`;
    const archive = readBackupArchive(bytesSource(bytes));
    pickedFiles.set(uri, bytes);
    return { ...archive, uri, fileName: file.name };
  },

  async previewRestore(picked: PickedBackup): Promise<RestorePlan> {
    return planBackupRestore(picked.data, choosePhotoUri(picked, photoAccess(picked, false)));
  },

  async restoreBackup(picked: PickedBackup): Promise<RestoreSummary> {
    const plan = await planBackupRestore(picked.data, choosePhotoUri(picked, photoAccess(picked, true)));
    await applyRestorePlan(plan);
    return plan.summary;
  },
} satisfies typeof import('./backupFiles');

export const { shareBackupFile, pickBackupFile, previewRestore, restoreBackup } = api;
