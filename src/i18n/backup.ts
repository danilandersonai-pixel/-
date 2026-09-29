// Тексты резервной копии, которые собираются из чисел: «3 подопечных, 14 замеров, 6 фото».

import type { BackupCounts, BackupProblem } from '@/lib/backup';
import { pluralRu } from '@/utils/plural';

import { ru } from './ru';

const order = ['clients', 'measurements', 'workouts', 'photos'] as const;

/** Перечисление количеств; нули пропускаются, если все нули — «пока ничего» */
export function countsText(counts: BackupCounts): string {
  const parts = order
    .filter((key) => counts[key] > 0)
    .map((key) => `${counts[key]} ${pluralRu(counts[key], ru.backup.counts[key])}`);
  return parts.length > 0 ? parts.join(', ') : ru.backup.empty;
}

export function backupProblemText(problem: BackupProblem | null): string {
  return problem ? ru.restore.problems[problem] : ru.restore.problems.unknown;
}
