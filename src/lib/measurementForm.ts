import type { Measurement, MeasurementFields } from '@/db/schema';
import { isoToRuDate, parseRuDate } from '@/utils/date';
import { parseDecimal } from '@/utils/format';

export const measurementFields = [
  'weight',
  'height',
  'neck',
  'chest',
  'waist',
  'hips',
  'arm',
  'thigh',
  'calf',
  'skinfoldChest',
  'skinfoldAbdomen',
  'skinfoldThigh',
  'skinfoldTriceps',
  'skinfoldSuprailiac',
  'skinfoldCalf',
  'restingHeartRate',
] as const;

export type MeasurementField = (typeof measurementFields)[number];

const skinfoldRange = { min: 1, max: 80 };

/** Правдоподобные границы: всё, что за ними, — скорее всего опечатка */
export const fieldRanges: Record<MeasurementField, { min: number; max: number; integer?: boolean }> = {
  weight: { min: 20, max: 400 },
  height: { min: 100, max: 250 },
  neck: { min: 20, max: 70 },
  chest: { min: 50, max: 200 },
  waist: { min: 40, max: 250 },
  hips: { min: 50, max: 250 },
  arm: { min: 15, max: 70 },
  thigh: { min: 25, max: 110 },
  calf: { min: 20, max: 70 },
  skinfoldChest: skinfoldRange,
  skinfoldAbdomen: skinfoldRange,
  skinfoldThigh: skinfoldRange,
  skinfoldTriceps: skinfoldRange,
  skinfoldSuprailiac: skinfoldRange,
  skinfoldCalf: skinfoldRange,
  restingHeartRate: { min: 30, max: 200, integer: true },
};

export type MeasurementFormValues = { date: string } & Record<MeasurementField, string>;

export type MeasurementFormErrors = Partial<Record<MeasurementField | 'date', 'required' | 'invalid' | 'range'>>;

/** 72.5 → «72,5» */
export function numberToInput(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',');
}

function emptyValues(): Record<MeasurementField, string> {
  return Object.fromEntries(measurementFields.map((field) => [field, ''])) as Record<MeasurementField, string>;
}

export function measurementToFormValues(measurement: Measurement): MeasurementFormValues {
  const values = emptyValues();
  for (const field of measurementFields) {
    values[field] = numberToInput(measurement[field]);
  }
  return { date: isoToRuDate(measurement.date), ...values };
}

/** Новый замер: сегодняшняя дата и рост из прошлого замера — рост обычно не меняется */
export function newMeasurementFormValues(todayIso: string, previous: Measurement | null): MeasurementFormValues {
  return { ...emptyValues(), date: isoToRuDate(todayIso), height: numberToInput(previous?.height ?? null) };
}

/**
 * Форма → поля для сохранения. Без даты и веса сохранять нечего (fields = null).
 * Пустое поле стирает значение, неверное — не сохраняется и подсвечивается.
 */
export function formToMeasurementFields(values: MeasurementFormValues): {
  fields: MeasurementFields | null;
  errors: MeasurementFormErrors;
} {
  const errors: MeasurementFormErrors = {};
  const date = parseRuDate(values.date);
  if (!date) {
    errors.date = values.date.trim() === '' ? 'required' : 'invalid';
  }

  const parsed: Partial<Record<MeasurementField, number | null>> = {};
  for (const field of measurementFields) {
    const text = values[field].trim();
    if (text === '') {
      parsed[field] = null;
      continue;
    }
    const number = parseDecimal(text);
    const range = fieldRanges[field];
    if (number === null) {
      errors[field] = 'invalid';
    } else if (number < range.min || number > range.max) {
      errors[field] = 'range';
    } else {
      parsed[field] = range.integer ? Math.round(number) : number;
    }
  }
  if (values.weight.trim() === '') {
    errors.weight = 'required';
  }

  const weight = parsed.weight;
  if (!date || weight === null || weight === undefined) {
    return { fields: null, errors };
  }
  return { fields: { ...parsed, date, weight }, errors };
}
