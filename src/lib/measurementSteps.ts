import type { Gender } from '@/db/schema';

import type { MeasurementField } from './measurementForm';

export type MeasurementStepKey = 'basics' | 'girths' | 'skinfolds';

export type MeasurementStep = { key: MeasurementStepKey; fields: readonly MeasurementField[] };

/**
 * Шаги ввода замера. Порядок полей зависит от пола: сначала то, что нужно для % жира
 * по формулам именно для этого пола.
 */
export function measurementSteps(sex: Gender | null): MeasurementStep[] {
  const female = sex === 'female';
  return [
    { key: 'basics', fields: ['weight', 'height', 'restingHeartRate'] },
    {
      key: 'girths',
      fields: female
        ? ['neck', 'waist', 'hips', 'chest', 'arm', 'thigh', 'calf']
        : ['neck', 'waist', 'chest', 'hips', 'arm', 'thigh', 'calf'],
    },
    {
      key: 'skinfolds',
      fields: female
        ? ['skinfoldTriceps', 'skinfoldSuprailiac', 'skinfoldThigh', 'skinfoldCalf', 'skinfoldChest', 'skinfoldAbdomen']
        : ['skinfoldChest', 'skinfoldAbdomen', 'skinfoldThigh', 'skinfoldTriceps', 'skinfoldCalf', 'skinfoldSuprailiac'],
    },
  ];
}

export type FieldPurpose = 'bodyFat' | 'muscle';

/** Для чего нужно поле: чтобы тренер видел, что можно пропустить */
export function fieldPurposes(field: MeasurementField, sex: Gender | null): FieldPurpose[] {
  const bodyFat = new Set<MeasurementField>(['height', 'neck', 'waist']);
  if (sex !== 'male') {
    bodyFat.add('hips');
  }
  const jp3 =
    sex === 'female'
      ? ['skinfoldTriceps', 'skinfoldSuprailiac', 'skinfoldThigh']
      : sex === 'male'
        ? ['skinfoldChest', 'skinfoldAbdomen', 'skinfoldThigh']
        : [];
  jp3.forEach((site) => bodyFat.add(site as MeasurementField));
  const muscle = new Set<MeasurementField>(['height', 'arm', 'thigh', 'calf', 'skinfoldTriceps', 'skinfoldThigh', 'skinfoldCalf']);

  const purposes: FieldPurpose[] = [];
  if (bodyFat.has(field)) {
    purposes.push('bodyFat');
  }
  if (muscle.has(field)) {
    purposes.push('muscle');
  }
  return purposes;
}

export function fieldUnit(field: MeasurementField): 'kg' | 'cm' | 'mm' | 'bpm' {
  if (field === 'weight') {
    return 'kg';
  }
  if (field === 'restingHeartRate') {
    return 'bpm';
  }
  return field.startsWith('skinfold') ? 'mm' : 'cm';
}
