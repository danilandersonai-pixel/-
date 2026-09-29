import { goalFormToFields, goalProgress } from './goals';

const series = (values: [string, number][]) => values.map(([date, value]) => ({ date, value }));

describe('цель подопечного', () => {
  const weekly = series([
    ['2026-09-01', 26],
    ['2026-09-08', 25.5],
    ['2026-09-15', 25],
    ['2026-09-22', 24.5],
    ['2026-09-29', 24],
  ]);

  it('путь, остаток, темп и прогноз', () => {
    const result = goalProgress({ targetValue: 20, targetDate: '2027-01-31', startDate: '2026-09-01' }, weekly);
    expect(result.start).toEqual({ date: '2026-09-01', value: 26 });
    expect(result.current).toEqual({ date: '2026-09-29', value: 24 });
    expect(result.progress).toBeCloseTo(2 / 6, 5);
    expect(result.remaining).toBeCloseTo(-4, 5);
    expect(result.perWeek).toBeCloseTo(-0.5, 5);
    // −4 при −0,5 в неделю → 8 недель → 56 дней после 29.09
    expect(result.forecast).toBe('2026-11-24');
    expect(result.onTime).toBe(true);
    expect(result.reached).toBe(false);
  });

  it('к сроку не успевает', () => {
    const result = goalProgress({ targetValue: 20, targetDate: '2026-10-31', startDate: '2026-09-01' }, weekly);
    expect(result.onTime).toBe(false);
  });

  it('темп ведёт от цели — прогноза нет', () => {
    const result = goalProgress({ targetValue: 30, targetDate: null, startDate: '2026-09-01' }, weekly);
    expect(result.forecast).toBeNull();
    expect(result.progress).toBe(0);
    expect(result.onTime).toBeNull();
  });

  it('цель достигнута', () => {
    const result = goalProgress({ targetValue: 24.5, targetDate: '2026-12-01', startDate: '2026-09-01' }, weekly);
    expect(result).toMatchObject({ reached: true, progress: 1, remaining: 0, onTime: true });
  });

  it('старт — последний замер до постановки цели; мало данных — без темпа', () => {
    const result = goalProgress(
      { targetValue: 80, targetDate: null, startDate: '2026-09-20' },
      series([
        ['2026-09-01', 75],
        ['2026-09-18', 76],
        ['2026-09-21', 76.4],
      ]),
    );
    expect(result.start).toEqual({ date: '2026-09-18', value: 76 });
    expect(result.progress).toBeCloseTo(0.1, 5);
    expect(result.perWeek).not.toBeNull();
    expect(goalProgress({ targetValue: 80, targetDate: null, startDate: '2026-09-20' }, series([['2026-09-21', 76]])).perWeek).toBeNull();
    expect(goalProgress({ targetValue: 80, targetDate: null, startDate: '2026-09-20' }, [])).toMatchObject({ current: null, progress: null });
  });
});

describe('форма цели', () => {
  it('значение обязательно, срок — нет', () => {
    expect(goalFormToFields({ metric: 'weight', target: '62,5', targetDate: '' }, '2026-09-29')).toEqual({
      fields: { metric: 'weight', targetValue: 62.5, startDate: '2026-09-29', targetDate: null },
      errors: {},
    });
    expect(goalFormToFields({ metric: 'weight', target: '62', targetDate: '01.06.2027' }, '2026-09-29').fields?.targetDate).toBe('2027-06-01');
    expect(goalFormToFields({ metric: 'weight', target: '', targetDate: '' }, '2026-09-29')).toEqual({ fields: null, errors: { target: 'required' } });
    expect(goalFormToFields({ metric: 'weight', target: 'много', targetDate: '31.02.2027' }, '2026-09-29').errors).toEqual({
      target: 'invalid',
      targetDate: 'invalid',
    });
  });
});
