// Функции работы с данными (src/db/*.ts) на настоящем SQLite с миграциями приложения.

import { applyRestorePlan, exportBackup, planBackupRestore } from './backup';
import { fillDemoData } from './demo';
import { deleteGoal, getGoal, saveGoal } from './goals';
import { getClient, listActiveClients, listArchivedClients, saveClient, setClientArchived } from './clients';
import { getActiveConsent, giveConsent, revokeConsent } from './consents';
import { getHealth, saveHealth } from './health';
import { deleteMeasurement, getMeasurement, listAllMeasurements, listMeasurements, saveMeasurement } from './measurements';
import { listNutritionPlans, saveNutritionPlan } from './nutrition';
import { addPhoto, deletePhoto, listPhotos } from './photos';
import {
  deleteWorkout,
  getLastWorkoutExercises,
  getWorkoutDetails,
  listExerciseSessions,
  listPlannedFrom,
  listWorkouts,
  listWorkoutsBetween,
  saveWorkout,
} from './workouts';

jest.mock('./database', () => {
  const { createTestDatabase } = jest.requireActual('./testing/testDatabase');
  return { db: createTestDatabase().db };
});

jest.mock('./photoFiles', () => ({
  resolvePhotoUri: (stored: string) => `resolved:${stored}`,
}));

jest.mock('./ids', () => ({
  newId: () => jest.requireActual('node:crypto').randomUUID(),
}));

async function makeClient(id: string, firstName: string) {
  await saveClient(id, { firstName });
}

describe('подопечные', () => {
  it('создание, частичное обновление, сортировка и архив', async () => {
    await saveClient('c-b', { firstName: 'Юлия', gender: 'female', birthDate: '1990-01-01' });
    await saveClient('c-a', { firstName: 'Анна', lastName: 'Петрова' });
    // обновляем только цель — остальные поля должны сохраниться
    await saveClient('c-b', { firstName: 'Юлия', goal: 'Минус 5 кг' });

    const julia = await getClient('c-b');
    expect(julia).toMatchObject({ firstName: 'Юлия', gender: 'female', birthDate: '1990-01-01', goal: 'Минус 5 кг', archived: false });
    expect((await listActiveClients()).map((c) => c.id)).toEqual(['c-a', 'c-b']);

    await setClientArchived('c-a', true);
    expect((await listActiveClients()).map((c) => c.id)).toEqual(['c-b']);
    expect((await listArchivedClients()).map((c) => c.id)).toEqual(['c-a']);
    await setClientArchived('c-a', false);
    expect(await getClient('нет-такого')).toBeNull();
  });
});

describe('согласие и здоровье', () => {
  it('действующее согласие, отзыв и повторное согласие', async () => {
    await makeClient('c-consent', 'Иван');
    expect(await getActiveConsent('c-consent')).toBeNull();
    await giveConsent('c-consent', 'Иван Иванов');
    const first = await getActiveConsent('c-consent');
    expect(first).toMatchObject({ signedBy: 'Иван Иванов', textVersion: '1', revokedAt: null });
    await revokeConsent(first?.id ?? '');
    expect(await getActiveConsent('c-consent')).toBeNull();
    await giveConsent('c-consent', 'Иван Иванов');
    expect(await getActiveConsent('c-consent')).not.toBeNull();
  });

  it('здоровье — одна запись на подопечного, поля дополняются', async () => {
    await makeClient('c-health', 'Олег');
    await saveHealth('c-health', { injuries: 'Колено' });
    await saveHealth('c-health', { contraindications: 'Гипертония' });
    expect(await getHealth('c-health')).toMatchObject({ injuries: 'Колено', contraindications: 'Гипертония' });
  });
});

describe('замеры', () => {
  it('порядок, обновление и удаление с пометкой', async () => {
    await makeClient('c-m', 'Мария');
    await saveMeasurement('m1', 'c-m', { date: '2026-09-01', weight: 70, waist: 80 });
    await saveMeasurement('m2', 'c-m', { date: '2026-09-15', weight: 69 });
    await saveMeasurement('m2', 'c-m', { date: '2026-09-15', weight: 68.5, skinfoldChest: 12 });

    const list = await listMeasurements('c-m');
    expect(list.map((m) => m.id)).toEqual(['m2', 'm1']);
    expect(list[0]).toMatchObject({ weight: 68.5, skinfoldChest: 12 });

    await deleteMeasurement('m1');
    expect((await listMeasurements('c-m')).map((m) => m.id)).toEqual(['m2']);
    expect(await getMeasurement('m1')).toBeNull();
    expect((await listAllMeasurements()).some((m) => m.id === 'm1')).toBe(false);
  });
});

describe('фото', () => {
  it('старые сначала, удаление скрывает', async () => {
    await makeClient('c-p', 'Пётр');
    const later = await addPhoto('c-p', '2026-09-20', 'front', 'photos/b.jpg');
    const earlier = await addPhoto('c-p', '2026-09-01', 'front', 'photos/a.jpg');
    expect((await listPhotos('c-p')).map((p) => p.id)).toEqual([earlier, later]);
    // путь из базы превращается в адрес для показа на этом телефоне
    expect((await listPhotos('c-p'))[0].uri).toBe('resolved:photos/a.jpg');
    await deletePhoto(earlier);
    expect((await listPhotos('c-p')).map((p) => p.id)).toEqual([later]);
  });
});

describe('тренировки', () => {
  const set = (id: string, reps: number, weight: number) => ({ id, reps, weight, restSec: 90 });

  it('сохранение с упражнениями, удаление подходов и упражнений', async () => {
    await makeClient('c-w', 'Ирина');
    await saveWorkout('w1', 'c-w', { date: '2026-09-10', status: 'done', durationMin: 60 }, [
      { id: 'e1', name: 'Присед', sets: [set('s1', 10, 40), set('s2', 8, 45)] },
      { id: 'e2', name: 'Жим', sets: [set('s3', 10, 30)] },
    ]);
    await saveWorkout('w1', 'c-w', { date: '2026-09-10', status: 'done', durationMin: 65 }, [
      { id: 'e1', name: 'Присед со штангой', sets: [set('s1', 10, 42.5)] },
    ]);

    const details = await getWorkoutDetails('w1');
    expect(details?.workout.durationMin).toBe(65);
    expect(details?.exercises).toEqual([
      { id: 'e1', name: 'Присед со штангой', sets: [{ id: 's1', reps: 10, weight: 42.5, restSec: 90 }] },
    ]);
    expect((await listWorkouts('c-w'))[0].exerciseCount).toBe(1);
  });

  it('календарь, запланированные, повтор прошлой и удаление', async () => {
    await saveWorkout('w2', 'c-w', { date: '2026-10-02', status: 'planned', startTime: '18:30' }, []);
    expect((await listWorkoutsBetween('2026-09-01', '2026-09-30')).map((w) => w.id)).toEqual(['w1']);
    expect((await listPlannedFrom('2026-09-29')).map((w) => w.id)).toEqual(['w2']);
    const last = await getLastWorkoutExercises('c-w', 'w2');
    expect(last.map((e) => e.name)).toEqual(['Присед со штангой']);

    // Для рекордов — только проведённые тренировки, упражнения с подходами по порядку
    await saveWorkout('w0', 'c-w', { date: '2026-09-05', status: 'done' }, [
      { id: 'e0', name: 'Присед', sets: [set('s0a', 12, 40), set('s0b', 10, 42.5)] },
      { id: 'e0-empty', name: 'Растяжка', sets: [] },
    ]);
    expect(await listExerciseSessions('c-w')).toEqual([
      { workoutId: 'w0', date: '2026-09-05', name: 'Присед', sets: [{ reps: 12, weight: 40 }, { reps: 10, weight: 42.5 }] },
      { workoutId: 'w0', date: '2026-09-05', name: 'Растяжка', sets: [] },
      { workoutId: 'w1', date: '2026-09-10', name: 'Присед со штангой', sets: [{ reps: 10, weight: 42.5 }] },
    ]);
    await deleteWorkout('w0');

    await deleteWorkout('w1');
    expect(await listExerciseSessions('c-w')).toEqual([]);
    expect((await listWorkouts('c-w')).map((w) => w.id)).toEqual(['w2']);
    expect(await getWorkoutDetails('w1')).toBeNull();
  });
});

describe('питание и резервная копия', () => {
  it('планы питания — новые сверху', async () => {
    await makeClient('c-n', 'Дмитрий');
    await saveNutritionPlan('n1', 'c-n', { startDate: '2026-09-01', calories: 2400 });
    await saveNutritionPlan('n2', 'c-n', { startDate: '2026-09-20', calories: 2600, protein: 160 });
    await saveNutritionPlan('n1', 'c-n', { startDate: '2026-09-01', calories: 2300 });
    const plans = await listNutritionPlans('c-n');
    expect(plans.map((p) => [p.id, p.calories])).toEqual([
      ['n2', 2600],
      ['n1', 2300],
    ]);
  });

  it('резервная копия содержит все таблицы', async () => {
    const backup = await exportBackup();
    expect(backup.tables.clients.length).toBeGreaterThanOrEqual(7);
    // w1, w2 и удалённая w0 (удалённые тоже в копии — строки остаются)
    expect(backup.tables.workouts.length).toBe(3);
    expect(backup.tables.workout_exercises.length).toBe(3);
    expect(backup.tables.sets.length).toBe(3);
    expect(backup.tables.nutrition_plans.length).toBe(2);
    expect(backup.tables.consents.length).toBe(2);
  });
});

describe('цели', () => {
  it('действующая — последняя неудалённая, правка и удаление', async () => {
    await makeClient('c-goal', 'Вера');
    expect(await getGoal('c-goal')).toBeNull();
    await saveGoal('g1', 'c-goal', { metric: 'weight', targetValue: 60, startDate: '2026-09-01' });
    await saveGoal('g1', 'c-goal', { metric: 'bodyFat', targetValue: 22, startDate: '2026-09-01', targetDate: '2027-01-01' });
    expect(await getGoal('c-goal')).toMatchObject({ id: 'g1', metric: 'bodyFat', targetValue: 22, targetDate: '2027-01-01' });
    await deleteGoal('g1');
    expect(await getGoal('c-goal')).toBeNull();
    // строка осталась — для резервной копии и будущей синхронизации
    expect((await exportBackup()).tables.goals.some((g) => g.id === 'g1')).toBe(true);
  });
});

describe('восстановление из резервной копии', () => {
  it('сливает копию с данными на телефоне и повтор ничего не меняет', async () => {
    const backup = await exportBackup();
    const keepUri = (row: Record<string, unknown>) => row.uri as string;

    // После копии на телефоне что-то изменили, а что-то потеряли
    await saveClient('c-b', { firstName: 'Юлия', goal: 'Изменено после копии' });
    await saveMeasurement('m-new', 'c-m', { date: '2026-09-28', weight: 67 });

    // Восстановление той же копии: изменения после копии не откатываются
    const plan = await planBackupRestore(backup, keepUri);
    expect(plan.actions).toEqual([]);
    expect((await getClient('c-b'))?.goal).toBe('Изменено после копии');
    expect(await getMeasurement('m-new')).not.toBeNull();

    // Копия с более новой версией тренировки: упражнения берутся из копии
    const details = await getWorkoutDetails('w2');
    expect(details).not.toBeNull();
    const newer = {
      ...backup,
      tables: {
        ...backup.tables,
        workouts: backup.tables.workouts.map((w) => (w.id === 'w2' ? { ...w, notes: 'Из копии', updatedAt: Date.now() + 1000 } : w)),
        workout_exercises: [
          ...backup.tables.workout_exercises,
          { id: 'e-backup', workoutId: 'w2', position: 0, name: 'Тяга из копии', createdAt: 1, updatedAt: 1 },
        ],
        sets: [
          ...backup.tables.sets,
          { id: 's-backup', exerciseId: 'e-backup', position: 0, reps: 5, weight: 100, restSec: null, createdAt: 1, updatedAt: 1 },
        ],
      },
    };
    const workoutPlan = await planBackupRestore(newer, keepUri);
    await applyRestorePlan(workoutPlan);
    const restored = await getWorkoutDetails('w2');
    expect(restored?.workout.notes).toBe('Из копии');
    expect(restored?.exercises).toEqual([
      { id: 'e-backup', name: 'Тяга из копии', sets: [{ id: 's-backup', reps: 5, weight: 100, restSec: null }] },
    ]);
    expect((await planBackupRestore(newer, keepUri)).actions).toEqual([]);
  });

  it('на «чистый» телефон копия переносится целиком', async () => {
    const backup = await exportBackup();
    const { createTestDatabase } = jest.requireActual('./testing/testDatabase');
    const fresh = createTestDatabase();
    const database = jest.requireMock('./database') as { db: unknown };
    const original = database.db;
    database.db = fresh.db;
    try {
      expect((await exportBackup()).tables.clients).toEqual([]);
      const plan = await planBackupRestore(backup, (row) => row.uri as string);
      expect(plan.summary.skipped).toBe(0);
      expect(plan.actions.length).toBe(Object.values(backup.tables).reduce((sum, rows) => sum + rows.length, 0));
      await applyRestorePlan(plan);
      const copy = await exportBackup();
      for (const table of Object.keys(backup.tables) as (keyof typeof backup.tables)[]) {
        expect(copy.tables[table].length).toBe(backup.tables[table].length);
      }
      expect((await getClient('c-b'))?.firstName).toBe('Юлия');
    } finally {
      database.db = original;
    }
  });
});

describe('демо-данные', () => {
  it('«Заполнить примером» добавляет трёх подопечных со всей историей', async () => {
    const before = (await listActiveClients()).length;
    expect(await fillDemoData()).toBe(3);
    const clients = await listActiveClients();
    expect(clients.length).toBe(before + 3);
    const anna = clients.find((c) => c.firstName === 'Анна' && c.lastName === 'Смирнова');
    expect(anna).toBeDefined();
    expect(await getActiveConsent(anna?.id ?? '')).not.toBeNull();
    expect((await listMeasurements(anna?.id ?? '')).length).toBe(7);
    expect((await listWorkouts(anna?.id ?? '')).length).toBe(13);
    expect((await listNutritionPlans(anna?.id ?? '')).length).toBe(1);
  });
});
