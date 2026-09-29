import type { Measurement } from '@/db/schema';

import { csvFileName, measurementsCsv, toCsv } from './csv';

function measurement(date: string, fields: Partial<Measurement>): Measurement {
  return {
    id: date,
    clientId: 'c',
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
    ...fields,
  };
}

describe('CSV', () => {
  it('BOM, «;», дробная запятая и экранирование', () => {
    const csv = toCsv([
      ['Имя', 'Число', 'Пусто'],
      ['Анна; "Ника"', 12.345, null],
    ]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.slice(1)).toBe('Имя;Число;Пусто\r\n"Анна; ""Ника""";12,35;\r\n');
  });

  it('замеры: старые сверху, с посчитанным % жира', () => {
    const csv = measurementsCsv({ gender: 'male', birthDate: '1996-01-01' }, [
      measurement('2026-09-15', { weight: 69, height: 175, neck: 38, waist: 86 }),
      measurement('2026-09-01', { weight: 70 }),
    ]);
    const lines = csv.slice(1).trim().split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith('Дата;Вес;Рост;Шея')).toBe(true);
    expect(lines[1].startsWith('01.09.2026;70;')).toBe(true);
    // Контрольный пример ВМС: рост 175, шея 38, талия 86 → ≈ 17,7 %
    expect(lines[2]).toMatch(/^15\.09\.2026;69;175;38;;86;/);
    expect(lines[2]).toContain(';17,7');
    expect(lines[2]).toContain('По обхватам (ВМС США)');
  });

  it('имя файла', () => {
    expect(csvFileName({ firstName: 'Анна', lastName: 'Смирнова' })).toBe('Замеры Анна Смирнова.csv');
    expect(csvFileName({ firstName: 'А/Б', lastName: null })).toBe('Замеры АБ.csv');
  });
});
