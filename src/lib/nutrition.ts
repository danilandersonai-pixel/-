import type { Gender, NutritionFields, NutritionPlan } from '@/db/schema';
import { isoToRuDate, parseRuDate } from '@/utils/date';
import { parseDecimal } from '@/utils/format';

import { textOrNull } from './clientForm';
import { numberToInput } from './measurementForm';

/** Ккал в грамме: белки и углеводы — 4, жиры — 9 */
export const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 } as const;

export type Macros = { protein: number | null; fat: number | null; carbs: number | null };

/** Калории, которые дают граммы КБЖУ. null — если ни одного значения нет. */
export function caloriesFromMacros({ protein, fat, carbs }: Macros): number | null {
  if (protein === null && fat === null && carbs === null) {
    return null;
  }
  return (protein ?? 0) * KCAL_PER_GRAM.protein + (fat ?? 0) * KCAL_PER_GRAM.fat + (carbs ?? 0) * KCAL_PER_GRAM.carbs;
}

/** Доли калорий от белков, жиров и углеводов, в процентах (в сумме 100) */
export function macroShares(macros: Macros): { protein: number; fat: number; carbs: number } | null {
  const total = caloriesFromMacros(macros);
  if (!total) {
    return null;
  }
  return {
    protein: ((macros.protein ?? 0) * KCAL_PER_GRAM.protein * 100) / total,
    fat: ((macros.fat ?? 0) * KCAL_PER_GRAM.fat * 100) / total,
    carbs: ((macros.carbs ?? 0) * KCAL_PER_GRAM.carbs * 100) / total,
  };
}

/**
 * Базовый обмен по Миффлину — Сан Жеору (1990), ккал/сутки. Справочная оценка:
 * столько тратит тело в полном покое, без тренировок и движения.
 */
export function mifflinStJeor(input: {
  sex: Gender | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
}): number | null {
  const { sex, weightKg, heightCm, age } = input;
  if (!sex || !weightKg || !heightCm || !age) {
    return null;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

export type NutritionFormValues = {
  startDate: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  notes: string;
};

export type NutritionFormErrors = Partial<Record<keyof NutritionFormValues, 'required' | 'invalid'>>;

export function planToFormValues(plan: NutritionPlan): NutritionFormValues {
  return {
    startDate: isoToRuDate(plan.startDate),
    calories: numberToInput(plan.calories),
    protein: numberToInput(plan.protein),
    fat: numberToInput(plan.fat),
    carbs: numberToInput(plan.carbs),
    notes: plan.notes ?? '',
  };
}

const limits = { calories: 5000, protein: 500, fat: 400, carbs: 1000 } as const;

export function formToNutritionFields(values: NutritionFormValues): {
  fields: NutritionFields | null;
  errors: NutritionFormErrors;
} {
  const errors: NutritionFormErrors = {};
  const startDate = parseRuDate(values.startDate);
  if (!startDate) {
    errors.startDate = values.startDate.trim() === '' ? 'required' : 'invalid';
  }
  const fields: Partial<NutritionFields> = { notes: textOrNull(values.notes) };
  for (const key of ['calories', 'protein', 'fat', 'carbs'] as const) {
    const text = values[key].trim();
    if (text === '') {
      fields[key] = null;
      continue;
    }
    const number = parseDecimal(text);
    if (number === null || number < 0 || number > limits[key]) {
      errors[key] = 'invalid';
    } else {
      fields[key] = key === 'calories' ? Math.round(number) : number;
    }
  }
  return { fields: startDate ? { ...fields, startDate } : null, errors };
}
