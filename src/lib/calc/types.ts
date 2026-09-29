// Общие типы калькулятора состава тела.
// Единицы: сантиметры, килограммы, миллиметры (складки), годы.

export type Sex = 'male' | 'female';

export type CalcMethod =
  | 'navy'
  | 'jp3'
  | 'fromBodyFat'
  | 'boer'
  | 'bmi'
  | 'ffmi'
  | 'ffmiNormalized'
  | 'lee';

/** Данные, без которых формула не считается */
export type CalcInput =
  | 'sex'
  | 'age'
  | 'height'
  | 'weight'
  | 'neck'
  | 'waist'
  | 'hips'
  | 'arm'
  | 'thigh'
  | 'calf'
  | 'skinfoldChest'
  | 'skinfoldAbdomen'
  | 'skinfoldThigh'
  | 'skinfoldTriceps'
  | 'skinfoldSuprailiac'
  | 'skinfoldCalf';

/** Почему не посчиталось: не хватает данных или данные невозможны */
export type CalcProblem =
  | { kind: 'missing'; inputs: readonly CalcInput[] }
  | { kind: 'invalid'; code: 'waistNotAboveNeck' | 'correctedGirthNotPositive' | 'implausibleResult' };

/**
 * Результат формулы. value = null — посчитать нельзя, причина в problem.
 * errorMargin — погрешность «±» в тех же единицах, null — не оценивается.
 */
export type CalcOutput =
  | { value: number; method: CalcMethod; errorMargin: number | null }
  | { value: null; method: CalcMethod; problem: CalcProblem };

export type CalcSuccess = Extract<CalcOutput, { value: number }>;

export function ok(method: CalcMethod, value: number, errorMargin: number | null): CalcOutput {
  return { value, method, errorMargin };
}

export function invalid(method: CalcMethod, code: Extract<CalcProblem, { kind: 'invalid' }>['code']): CalcOutput {
  return { value: null, method, problem: { kind: 'invalid', code } };
}

/** Проверяет, что все нужные значения есть и больше нуля. Возвращает список отсутствующих. */
export function findMissing(values: Partial<Record<CalcInput, number | string | null | undefined>>): CalcInput[] {
  return (Object.keys(values) as CalcInput[]).filter((key) => {
    const value = values[key];
    return value === null || value === undefined || (typeof value === 'number' && !(value > 0));
  });
}

export function missing(method: CalcMethod, inputs: readonly CalcInput[]): CalcOutput {
  return { value: null, method, problem: { kind: 'missing', inputs } };
}

export function isSuccess(output: CalcOutput): output is CalcSuccess {
  return output.value !== null;
}
