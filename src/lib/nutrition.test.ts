import { caloriesFromMacros, formToNutritionFields, macroShares, mifflinStJeor } from './nutrition';

describe('питание', () => {
  it('калории из КБЖУ: 4 / 9 / 4 ккал на грамм', () => {
    expect(caloriesFromMacros({ protein: 150, fat: 70, carbs: 200 })).toBe(150 * 4 + 70 * 9 + 200 * 4);
    expect(caloriesFromMacros({ protein: null, fat: null, carbs: null })).toBeNull();
  });

  it('доли калорий в сумме дают 100 %', () => {
    const shares = macroShares({ protein: 150, fat: 70, carbs: 200 });
    expect(shares).not.toBeNull();
    expect((shares?.protein ?? 0) + (shares?.fat ?? 0) + (shares?.carbs ?? 0)).toBeCloseTo(100, 5);
    expect(shares?.fat).toBeCloseTo((630 / 2030) * 100, 5);
  });

  it('базовый обмен по Миффлину — Сан Жеору', () => {
    expect(mifflinStJeor({ sex: 'male', weightKg: 70, heightCm: 175, age: 30 })).toBeCloseTo(1648.75, 2);
    expect(mifflinStJeor({ sex: 'female', weightKg: 60, heightCm: 165, age: 30 })).toBeCloseTo(1320.25, 2);
    expect(mifflinStJeor({ sex: null, weightKg: 60, heightCm: 165, age: 30 })).toBeNull();
  });

  it('форма плана', () => {
    const result = formToNutritionFields({
      startDate: '01.10.2026',
      calories: '2100,4',
      protein: '150',
      fat: 'много',
      carbs: '',
      notes: ' Без сахара ',
    });
    expect(result.errors).toEqual({ fat: 'invalid' });
    expect(result.fields).toEqual({ startDate: '2026-10-01', calories: 2100, protein: 150, carbs: null, notes: 'Без сахара' });
  });
});
