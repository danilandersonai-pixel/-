import { parseReminderLead, planWorkoutReminders } from './workoutReminders';

const names = new Map([
  ['c1', 'Анна'],
  ['c2', 'Игорь'],
]);
// 29.09.2026, 10:00 по местному времени
const now = new Date(2026, 8, 29, 10, 0);
const w = (id: string, clientId: string, date: string, startTime: string | null, status: 'planned' | 'done' = 'planned') => ({
  id,
  clientId,
  date,
  startTime,
  status,
});

describe('напоминания о тренировках', () => {
  it('за выбранное время до начала, по порядку', () => {
    const list = planWorkoutReminders(
      [w('w2', 'c2', '2026-09-30', '08:30'), w('w1', 'c1', '2026-09-29', '19:00')],
      names,
      60,
      now,
    );
    expect(list.map((r) => [r.id, r.at.getTime(), r.clientName, r.startTime])).toEqual([
      ['w1', new Date(2026, 8, 29, 18, 0).getTime(), 'Анна', '19:00'],
      ['w2', new Date(2026, 8, 30, 7, 30).getTime(), 'Игорь', '08:30'],
    ]);
  });

  it('без времени — утром в день тренировки; прошедшее и проведённое пропускаем', () => {
    const list = planWorkoutReminders(
      [
        w('today-no-time', 'c1', '2026-09-29', null),
        w('tomorrow-no-time', 'c1', '2026-09-30', null),
        w('soon', 'c1', '2026-09-29', '10:30'),
        w('done', 'c1', '2026-09-30', '19:00', 'done'),
      ],
      names,
      60,
      now,
    );
    expect(list.map((r) => [r.id, r.at.getHours()])).toEqual([['tomorrow-no-time', 9]]);
  });

  it('архивных подопечных и дальше двух недель не напоминаем, не больше 50', () => {
    expect(planWorkoutReminders([w('x', 'archived', '2026-09-30', '19:00')], names, 30, now)).toEqual([]);
    expect(planWorkoutReminders([w('far', 'c1', '2026-10-14', '19:00')], names, 30, now)).toEqual([]);
    expect(planWorkoutReminders([w('edge', 'c1', '2026-10-13', '19:00')], names, 30, now)).toHaveLength(1);
    const many = Array.from({ length: 80 }, (_, i) => w(`m${i}`, 'c1', '2026-10-01', `${String(10 + (i % 12)).padStart(2, '0')}:00`));
    expect(planWorkoutReminders(many, names, 30, now)).toHaveLength(50);
  });

  it('настройка из хранилища', () => {
    expect(parseReminderLead('60')).toBe('60');
    expect(parseReminderLead(null)).toBe('off');
    expect(parseReminderLead('15')).toBe('off');
  });
});
