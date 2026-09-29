import { buildDemoData } from '@/lib/demoData';
import { toIsoDate } from '@/utils/date';

import { saveClient } from './clients';
import { giveConsent } from './consents';
import { saveGoal } from './goals';
import { saveHealth } from './health';
import { newId } from './ids';
import { saveMeasurement } from './measurements';
import { saveNutritionPlan } from './nutrition';
import { saveWorkout } from './workouts';

/**
 * «Заполнить примером»: три вымышленных подопечных с согласием, замерами, тренировками и питанием.
 * Записывает теми же функциями, что и обычный ввод, — на телефоне в SQLite, в превью в браузер.
 * Возвращает, сколько подопечных добавлено.
 */
export async function fillDemoData(): Promise<number> {
  const demo = buildDemoData(toIsoDate(new Date()), newId);
  for (const client of demo) {
    await saveClient(client.id, client.fields);
    await giveConsent(client.id, client.consentBy);
    if (client.health) {
      await saveHealth(client.id, client.health);
    }
    for (const measurement of client.measurements) {
      await saveMeasurement(measurement.id, client.id, measurement.fields);
    }
    for (const workout of client.workouts) {
      await saveWorkout(workout.id, client.id, workout.fields, workout.exercises);
    }
    if (client.nutrition) {
      await saveNutritionPlan(newId(), client.id, client.nutrition);
    }
    if (client.goal) {
      await saveGoal(newId(), client.id, client.goal);
    }
  }
  return demo.length;
}
