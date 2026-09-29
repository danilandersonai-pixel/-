import { shareBackupFile, type BackupFileSummary } from './backupFiles';
import { lastBackupAt } from './settings';

/** Создать копию, открыть «Поделиться» и запомнить время — от него считается напоминание */
export async function saveBackupNow(): Promise<BackupFileSummary> {
  const summary = await shareBackupFile();
  lastBackupAt.set(Date.now());
  return summary;
}
