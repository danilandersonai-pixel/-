import type { Client, Measurement, Workout } from '@/db/schema';

import { measurementOverdueDays, measurementsDue, plannedOn, upcomingBirthdays } from './today';

const today = '2026-09-29';

function client(id: string, birthDate: string | null = null): Client {
  return {
    id,
    firstName: id,
    lastName: null,
    gender: null,
    birthDate,
    phone: null,
    email: null,
    messenger: null,
    goal: null,
    notes: null,
    photoUri: null,
    archived: false,
    createdAt: 0,
    updatedAt: 0,
  };
}

function measurement(clientId: string, date: string): Measurement {
  return {
    id: `${clientId}-${date}`,
    clientId,
    date,
    weight: 70,
    height: null,
    neck: null,
    chest: null,
    waist: null,
    hips: null,
    arm: null,
    thigh: null,
    calf: null,
    skinfoldChest: null,
    skinfoldAbdomen: null,
    skinfoldThigh: null,
    skinfoldTriceps: null,
    skinfoldSuprailiac: null,
    skinfoldCalf: null,
    restingHeartRate: null,
    deletedAt: null,
    createdAt: 0,
    updatedAt: 0,
  };
}

function workout(id: string, date: string, startTime: string | null, status: Workout['status'] = 'planned'): Workout {
  return { id, clientId: 'c', date, startTime, status, durationMin: 60, wellbeing: null, notes: null, deletedAt: null, createdAt: 0, updatedAt: 0 };
}

describe('пора делать замер', () => {
  it('через 30 дней и больше', () => {
    expect(measurementOverdueDays('2026-09-01', today)).toBeNull();
    expect(measurementOverdueDays('2026-08-30', today)).toBe(30);
    expect(measurementOverdueDays('2026-07-01', today)).toBe(90);
  });

  it('сначала самые давние, потом те, у кого замеров нет', () => {
    const clients = [client('fresh'), client('never'), client('old'), client('older')];
    const byClient = new Map([
      ['fresh', [measurement('fresh', '2026-09-20'), measurement('fresh', '2026-06-01')]],
      ['old', [measurement('old', '2026-08-25')]],
      ['older', [measurement('older', '2026-06-01'), measurement('older', '2026-05-01')]],
    ]);
    expect(measurementsDue(clients, byClient, today).map((d) => [d.client.id, d.daysSince])).toEqual([
      ['older', 120],
      ['old', 35],
      ['never', null],
    ]);
  });
});

describe('дни рождения', () => {
  it('сегодня и в ближайшую неделю, с возрастом', () => {
    const clients = [
      client('today', '1990-09-29'),
      client('week', '1988-10-06'),
      client('later', '1988-10-07'),
      client('passed', '1990-09-28'),
      client('none'),
    ];
    expect(upcomingBirthdays(clients, today).map((b) => [b.client.id, b.inDays, b.age])).toEqual([
      ['today', 0, 36],
      ['week', 7, 38],
    ]);
  });

  it('через Новый год и 29 февраля', () => {
    expect(upcomingBirthdays([client('ny', '2000-01-02')], '2026-12-30').map((b) => [b.inDays, b.age])).toEqual([[3, 27]]);
    expect(upcomingBirthdays([client('leap', '2000-02-29')], '2027-02-25').map((b) => [b.inDays, b.age])).toEqual([[3, 27]]);
    expect(upcomingBirthdays([client('leap', '2000-02-29')], '2028-02-25').map((b) => [b.inDays, b.age])).toEqual([[4, 28]]);
  });
});

describe('тренировки на сегодня', () => {
  it('только запланированные на этот день, по времени', () => {
    const list = [
      workout('evening', today, '19:00'),
      workout('no-time', today, null),
      workout('morning', today, '08:30'),
      workout('done', today, '07:00', 'done'),
      workout('tomorrow', '2026-09-30', '10:00'),
    ];
    expect(plannedOn(list, today).map((w) => w.id)).toEqual(['morning', 'evening', 'no-time']);
  });
});
