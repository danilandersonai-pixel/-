import {
  BackupError,
  backupCounts,
  backupFileName,
  backupPhotoEntry,
  backupTables,
  makeBackup,
  parseBackupJson,
  photoIdFromEntry,
  planHasChanges,
  planRestore,
  type BackupRow,
  type BackupTable,
} from './backup';

function empty(): Record<BackupTable, BackupRow[]> {
  return Object.fromEntries(backupTables.map((table) => [table, []])) as unknown as Record<BackupTable, BackupRow[]>;
}

const stamp = (updatedAt: number) => ({ createdAt: 1, updatedAt });
const client = (id: string, updatedAt = 10, firstName = 'Анна') => ({ id, firstName, archived: false, ...stamp(updatedAt) });
const measurement = (id: string, clientId: string, updatedAt = 10, weight = 70) => ({
  id,
  clientId,
  date: '2026-09-01',
  weight,
  deletedAt: null,
  ...stamp(updatedAt),
});
const photo = (id: string, clientId: string, uri: string, deletedAt: number | null = null) => ({
  id,
  clientId,
  date: '2026-09-01',
  angle: 'front',
  uri,
  deletedAt,
  ...stamp(10),
});
const workout = (id: string, clientId: string, updatedAt: number) => ({
  id,
  clientId,
  date: '2026-09-10',
  status: 'done',
  deletedAt: null,
  ...stamp(updatedAt),
});
const exercise = (id: string, workoutId: string, name = 'Присед') => ({ id, workoutId, position: 0, name, ...stamp(10) });
const set = (id: string, exerciseId: string, reps = 10) => ({ id, exerciseId, position: 0, reps, weight: 40, ...stamp(10) });

const keepPhotoUri = (row: BackupRow) => row.uri as string;

describe('резервная копия: формат', () => {
  it('содержит версию формата и дату', () => {
    const backup = makeBackup(empty(), new Date('2026-09-29T10:00:00Z'));
    expect(backup).toMatchObject({ app: 'sport-tracker', version: 2, exportedAt: '2026-09-29T10:00:00.000Z' });
    expect(Object.keys(backup.tables)).toHaveLength(9);
  });

  it('считает записи без удалённых', () => {
    const tables = empty();
    tables.clients = [{ id: 'a' }, { id: 'b' }];
    tables.measurements = [{ id: '1', deletedAt: null }, { id: '2', deletedAt: 123 }];
    tables.workouts = [{ id: 'w', deletedAt: null }];
    tables.photos = [{ id: 'p', deletedAt: null }, { id: 'p2', deletedAt: 5 }];
    expect(backupCounts(makeBackup(tables, new Date()))).toEqual({ clients: 2, measurements: 1, workouts: 1, photos: 1 });
  });

  it('имена файла и фото внутри архива', () => {
    expect(backupFileName('2026-09-29')).toBe('sport-tracker-backup-2026-09-29.zip');
    expect(backupPhotoEntry('abc')).toBe('photos/abc.jpg');
    expect(photoIdFromEntry('photos/abc.jpg')).toBe('abc');
    expect(photoIdFromEntry('backup.json')).toBeNull();
    expect(photoIdFromEntry('photos/sub/abc.jpg')).toBeNull();
  });
});

describe('резервная копия: чтение', () => {
  it('читает свою копию и старую версию 1', () => {
    const tables = empty();
    tables.clients = [client('c1')];
    const text = JSON.stringify({ ...makeBackup(tables, new Date()), version: 1 });
    const data = parseBackupJson(`﻿${text}`);
    expect(data.version).toBe(1);
    expect(data.tables.clients).toHaveLength(1);
  });

  it('недостающие таблицы считаются пустыми, мусорные строки отбрасываются', () => {
    const data = parseBackupJson(JSON.stringify({ app: 'sport-tracker', version: 2, tables: { clients: [client('c1'), 5, null] } }));
    expect(data.tables.clients).toHaveLength(1);
    expect(data.tables.sets).toEqual([]);
  });

  it('понятные причины отказа', () => {
    const problem = (text: string) => {
      try {
        parseBackupJson(text);
        return null;
      } catch (error) {
        return error instanceof BackupError ? error.problem : 'другая ошибка';
      }
    };
    expect(problem('не json')).toBe('damaged');
    expect(problem('{"hello":1}')).toBe('notBackup');
    expect(problem('[]')).toBe('notBackup');
    expect(problem('{"app":"sport-tracker","version":99,"tables":{}}')).toBe('newerVersion');
    expect(problem('{"app":"sport-tracker","tables":{}}')).toBe('damaged');
  });
});

describe('резервная копия: план восстановления', () => {
  it('на пустой телефон добавляется всё', () => {
    const tables = empty();
    tables.clients = [client('c1')];
    tables.measurements = [measurement('m1', 'c1')];
    tables.workouts = [workout('w1', 'c1', 10)];
    tables.workout_exercises = [exercise('e1', 'w1')];
    tables.sets = [set('s1', 'e1')];
    const plan = planRestore({ current: empty(), backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });
    expect(plan.actions.map((a) => [a.table, a.mode])).toEqual([
      ['clients', 'insert'],
      ['measurements', 'insert'],
      ['workouts', 'insert'],
      ['workout_exercises', 'insert'],
      ['sets', 'insert'],
    ]);
    expect(plan.summary).toMatchObject({ added: { clients: 1, measurements: 1, workouts: 1, photos: 0 }, updated: 0, skipped: 0 });
    expect(planHasChanges(plan)).toBe(true);
  });

  it('берётся более новая версия записи, ничего не удаляется', () => {
    const current = empty();
    current.clients = [client('c1', 20, 'Анна новая'), client('c2', 10, 'Только на телефоне')];
    current.measurements = [measurement('m1', 'c1', 10, 70)];
    const tables = empty();
    tables.clients = [client('c1', 15, 'Анна старая')];
    tables.measurements = [measurement('m1', 'c1', 30, 68)];
    const plan = planRestore({ current, backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });
    expect(plan.actions).toEqual([{ table: 'measurements', mode: 'update', row: tables.measurements[0] }]);
    expect(plan.summary).toMatchObject({ updated: 1, unchanged: 1 });
  });

  it('повторное восстановление той же копии ничего не меняет', () => {
    const tables = empty();
    tables.clients = [client('c1')];
    tables.measurements = [measurement('m1', 'c1')];
    const plan = planRestore({ current: tables, backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });
    expect(planHasChanges(plan)).toBe(false);
    expect(plan.summary.unchanged).toBe(2);
  });

  it('повреждённые записи и записи без подопечного пропускаются', () => {
    const tables = empty();
    tables.clients = [client('c1'), { id: 'bad', ...stamp(1) }];
    tables.measurements = [measurement('m1', 'нет-такого'), { ...measurement('m2', 'c1'), weight: 'много' }];
    tables.workouts = [{ ...workout('w1', 'c1', 1), status: 'странный' }];
    const plan = planRestore({ current: empty(), backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });
    expect(plan.actions.map((a) => a.row.id)).toEqual(['c1']);
    expect(plan.summary.skipped).toBe(4);
  });

  it('здоровье — одна запись на подопечного, даже если id разные', () => {
    const current = empty();
    current.clients = [client('c1')];
    current.health = [{ id: 'h-local', clientId: 'c1', injuries: 'Колено', ...stamp(10) }];
    const tables = empty();
    tables.health = [{ id: 'h-backup', clientId: 'c1', injuries: 'Колено и плечо', ...stamp(20) }];
    const plan = planRestore({ current, backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });
    expect(plan.actions).toEqual([
      { table: 'health', mode: 'update', row: { ...tables.health[0], id: 'h-local' } },
    ]);
  });

  it('у более новой тренировки из копии упражнения и подходы берутся из копии целиком', () => {
    const current = empty();
    current.clients = [client('c1')];
    current.workouts = [workout('w1', 'c1', 10), workout('w2', 'c1', 50)];
    current.workout_exercises = [exercise('e1', 'w1'), exercise('e-old', 'w1', 'Убрали'), exercise('e2', 'w2')];
    current.sets = [set('s1', 'e1'), set('s-old', 'e1'), set('s-old2', 'e-old'), set('s2', 'e2')];
    const tables = empty();
    tables.workouts = [workout('w1', 'c1', 20), workout('w2', 'c1', 40)];
    tables.workout_exercises = [exercise('e1', 'w1', 'Присед со штангой'), exercise('e2', 'w2', 'Старое название')];
    tables.sets = [set('s1', 'e1', 12), set('s-new', 'e1'), set('s2', 'e2', 1)];
    const plan = planRestore({ current, backup: makeBackup(tables, new Date()), photoUri: keepPhotoUri });

    expect(plan.actions.map((a) => [a.table, a.mode, a.row.id])).toEqual([
      ['workouts', 'update', 'w1'],
      ['workout_exercises', 'update', 'e1'],
      ['sets', 'update', 's1'],
      ['sets', 'insert', 's-new'],
    ]);
    expect(plan.staleExerciseIds).toEqual(['e-old']);
    expect(plan.staleSetIds.sort()).toEqual(['s-old', 's-old2']);
  });

  it('фото: путь выбирает слой файлов, фото без файла не добавляется', () => {
    const tables = empty();
    tables.clients = [client('c1')];
    tables.photos = [
      photo('p-in-zip', 'c1', 'file:///old/photos/a.jpg'),
      photo('p-lost', 'c1', 'file:///old/photos/b.jpg'),
      photo('p-deleted', 'c1', 'file:///old/photos/c.jpg', 99),
    ];
    const plan = planRestore({
      current: empty(),
      backup: makeBackup(tables, new Date()),
      photoUri: (row) => (row.id === 'p-in-zip' ? 'photos/p-in-zip.jpg' : null),
    });
    expect(plan.actions.filter((a) => a.table === 'photos').map((a) => [a.row.id, a.row.uri])).toEqual([
      ['p-in-zip', 'photos/p-in-zip.jpg'],
      ['p-deleted', 'file:///old/photos/c.jpg'],
    ]);
    expect(plan.summary).toMatchObject({ missingPhotos: 1, added: { photos: 1 } });
  });
});
