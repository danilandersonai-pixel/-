import { dayMonthTitle, monthGrid, monthRange, monthTitle, shiftMonth, shortWhen, weekdayOf } from './calendar';

describe('календарь', () => {
  it('сентябрь 2026 начинается со вторника', () => {
    const weeks = monthGrid({ year: 2026, month: 8 });
    expect(weeks[0]).toEqual([null, '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06']);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks[weeks.length - 1]).toContain('2026-09-30');
  });

  it('переход через год', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('название, границы месяца и день недели', () => {
    expect(monthTitle({ year: 2026, month: 8 })).toBe('Сентябрь 2026');
    expect(monthRange({ year: 2024, month: 1 })).toEqual({ from: '2024-02-01', to: '2024-02-29' });
    expect(weekdayOf('2026-09-29')).toBe('Вт');
    expect(weekdayOf('2026-10-04')).toBe('Вс');
  });
});

describe('shortWhen', () => {
  it('день недели, дата и время', () => {
    expect(shortWhen('2026-10-02', '18:00')).toBe('Пт 02.10, 18:00');
    expect(shortWhen('2026-10-02', null)).toBe('Пт 02.10');
  });
});

describe('dayMonthTitle', () => {
  it('день и месяц в родительном падеже', () => {
    expect(dayMonthTitle('2026-09-29')).toBe('29 сентября');
    expect(dayMonthTitle('2026-03-01')).toBe('1 марта');
  });
});
