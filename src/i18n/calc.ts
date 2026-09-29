// Тексты для результатов калькулятора: почему не посчиталось и что означает показатель.

import type { CompositionMetric, Composition } from '@/lib/calc/composition';
import type { CalcOutput } from '@/lib/calc/types';
import { fill } from '@/utils/format';

import { ru } from './ru';

/** Понятная причина, почему значение не посчиталось. null — всё посчиталось. */
export function problemText(output: CalcOutput): string | null {
  if (output.value !== null) {
    return null;
  }
  const { problem } = output;
  if (problem.kind === 'missing') {
    const inputs = problem.inputs.map((input) => ru.calcProblems.inputs[input]).join(', ');
    return fill(ru.calcProblems.missing, { inputs });
  }
  return ru.calcProblems[problem.code];
}

/** Объяснение для кнопки «?»: метод, точность, ограничения */
export function explanation(metric: CompositionMetric, composition: Composition): string {
  switch (metric) {
    case 'weight':
      return ru.explain.weight;
    case 'bodyFat':
      return composition.bodyFat.method === 'jp3' ? ru.explain.jp3 : ru.explain.navy;
    case 'fatMass':
      return ru.explain.fatMass;
    case 'leanMass':
      return composition.leanMass.method === 'boer' ? ru.explain.leanBoer : ru.explain.leanFromBodyFat;
    case 'skeletalMuscle':
      return `${ru.explain.lee} ${ru.calcWarnings.muscleIsNotLean}`;
    case 'bmi':
      return ru.explain.bmi;
    case 'ffmi':
    case 'ffmiNormalized':
      return ru.explain.ffmi;
  }
}
