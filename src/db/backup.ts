import { makeBackup, type BackupData } from '@/lib/backup';

import { db } from './database';
import { clients, consents, health, measurements, nutritionPlans, photos, sets, workoutExercises, workouts } from './schema';

/** Все данные приложения для резервной копии */
export async function exportBackup(): Promise<BackupData> {
  return makeBackup(
    {
      clients: await db.select().from(clients),
      consents: await db.select().from(consents),
      health: await db.select().from(health),
      measurements: await db.select().from(measurements),
      photos: await db.select().from(photos),
      workouts: await db.select().from(workouts),
      workout_exercises: await db.select().from(workoutExercises),
      sets: await db.select().from(sets),
      nutrition_plans: await db.select().from(nutritionPlans),
    },
    new Date(),
  );
}
