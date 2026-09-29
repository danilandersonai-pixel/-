import type { Client, Measurement, Photo, Workout } from '@/db/schema';

import { buildReportData, escapeHtml, lineChartSvg, reportBody, reportFileName, reportPeriod } from './report';

const client: Client = {
  id: 'c1',
  firstName: 'Анна',
  lastName: '<Петрова>',
  gender: 'female',
  birthDate: '1992-06-15',
  phone: null,
  email: null,
  messenger: null,
  goal: 'Минус 5 кг',
  notes: null,
  photoUri: null,
  archived: false,
  createdAt: 0,
  updatedAt: 0,
};

function m(date: string, weight: number, waist: number): Measurement {
  return {
    id: date,
    clientId: 'c1',
    date,
    weight,
    height: 165,
    neck: 33,
    chest: null,
    waist,
    hips: 100,
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

function w(date: string, status: 'done' | 'planned', durationMin: number): Workout {
  return { id: date + status, clientId: 'c1', date, startTime: null, durationMin, status, wellbeing: null, notes: null, deletedAt: null, createdAt: 0, updatedAt: 0 };
}

function photo(id: string, date: string): Photo {
  return { id, clientId: 'c1', date, angle: 'front', uri: `data:${id}`, deletedAt: null, createdAt: 0, updatedAt: 0 };
}

describe('период отчёта', () => {
  it('месяц, три месяца и всё время', () => {
    expect(reportPeriod('month', '2026-09-29', null)).toEqual({ from: '2026-08-30', to: '2026-09-29' });
    expect(reportPeriod('quarter', '2026-09-29', null).from).toBe('2026-06-30');
    expect(reportPeriod('all', '2026-09-29', '2026-01-10')).toEqual({ from: '2026-01-10', to: '2026-09-29' });
  });
});

describe('данные отчёта', () => {
  const data = buildReportData({
    client,
    measurements: [m('2026-09-28', 64, 72), m('2026-09-01', 66, 76), m('2026-06-01', 70, 80)],
    workouts: [w('2026-09-05', 'done', 60), w('2026-09-20', 'done', 30), w('2026-10-05', 'planned', 60)],
    plans: [],
    photos: [photo('p1', '2026-09-02'), photo('p2', '2026-09-27')],
    from: '2026-08-30',
    to: '2026-09-29',
  });

  it('берёт только замеры периода: было и стало', () => {
    expect(data.firstDate).toBe('2026-09-01');
    expect(data.lastDate).toBe('2026-09-28');
    const weight = data.rows.find((row) => row.metric === 'weight');
    expect(weight).toMatchObject({ start: 66, end: 64, unit: 'кг' });
    expect(data.rows.find((row) => row.metric === 'bodyFat')?.end).toBeLessThan(
      data.rows.find((row) => row.metric === 'bodyFat')?.start ?? 0,
    );
    expect(data.bodyFatMethod).toBe('navy');
  });

  it('тренировки: только проведённые в периоде', () => {
    expect(data.workouts.done).toBe(2);
    expect(data.workouts.hours).toBeCloseTo(1.5, 5);
  });

  it('фото до/после — первое и последнее в периоде', () => {
    expect(data.photos?.before.id).toBe('p1');
    expect(data.photos?.after.id).toBe('p2');
  });

  it('HTML: экранирует имя, содержит таблицу, график и фото', () => {
    const html = reportBody(data, { before: 'data:a', after: 'data:b' });
    expect(html).toContain('Анна &lt;Петрова&gt;');
    expect(html).not.toContain('<Петрова>');
    expect(html).toContain('<table>');
    expect(html).toContain('<svg');
    expect(html).toContain('src="data:b"');
    expect(html).toContain('30.08.2026 — 29.09.2026');
  });
});

describe('мелочи', () => {
  it('escapeHtml', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });

  it('график рисует линию по всем точкам', () => {
    const svg = lineChartSvg(
      [
        { date: '2026-09-01', value: 30 },
        { date: '2026-09-15', value: 29 },
        { date: '2026-09-28', value: 28.4 },
      ],
      '%',
    );
    expect((svg.match(/<circle/g) ?? []).length).toBe(3);
    expect(svg).toContain('28,4 %');
  });

  it('имя файла без запрещённых символов', () => {
    expect(reportFileName('Анна/Петрова', '2026-09-29')).toBe('Прогресс АннаПетрова 29.09.2026.pdf');
  });
});
