// Выгрузка замеров в CSV для Excel и Google Таблиц.
// Разделитель «;» и дробная запятая — так русский Excel открывает файл сразу, без мастера импорта.
// BOM в начале — чтобы Excel понял, что файл в UTF-8, и не испортил кириллицу.

import type { Client, Measurement } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { isSuccess, type CalcOutput } from '@/lib/calc/types';
import { isoToRuDate } from '@/utils/date';

import { clientFullName } from './clients';
import { compositionFor } from './measurements';

type Cell = string | number | null;

const BOM = '﻿';

function cellText(value: Cell): string {
  if (value === null) {
    return '';
  }
  const text = typeof value === 'number' ? String(Math.round(value * 100) / 100).replace('.', ',') : value;
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Cell[][]): string {
  return BOM + rows.map((row) => row.map(cellText).join(';')).join('\r\n') + '\r\n';
}

const measuredFields = [
  'weight',
  'height',
  'neck',
  'chest',
  'waist',
  'hips',
  'arm',
  'thigh',
  'calf',
  'skinfoldChest',
  'skinfoldAbdomen',
  'skinfoldThigh',
  'skinfoldTriceps',
  'skinfoldSuprailiac',
  'skinfoldCalf',
  'restingHeartRate',
] as const;

const value = (output: CalcOutput) => (isSuccess(output) ? output.value : null);

/** Таблица замеров подопечного: всё измеренное и посчитанное, старые сверху */
export function measurementsCsv(client: Pick<Client, 'gender' | 'birthDate'>, measurements: Measurement[]): string {
  const f = ru.measurement.fields;
  const m = ru.metrics;
  const header: Cell[] = [
    ru.csv.date,
    ...measuredFields.map((field) => f[field]),
    m.bodyFat,
    ru.csv.method,
    m.fatMass,
    m.leanMass,
    m.skeletalMuscle,
    m.bmi,
    m.ffmi,
  ];
  const rows = [...measurements]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((measurement) => {
      const c = compositionFor(measurement, client);
      return [
        isoToRuDate(measurement.date),
        ...measuredFields.map((field) => measurement[field]),
        value(c.bodyFat),
        isSuccess(c.bodyFat) ? ru.methods[c.bodyFat.method] : null,
        value(c.fatMass),
        value(c.leanMass),
        value(c.skeletalMuscle),
        value(c.bmi),
        value(c.ffmi),
      ];
    });
  return toCsv([header, ...rows]);
}

/** Имя файла: «Замеры Анна Смирнова.csv» — безопасные символы */
export function csvFileName(client: Pick<Client, 'firstName' | 'lastName'>): string {
  const safe = clientFullName(client).replace(/[\\/:*?"<>|]/g, '').trim() || 'подопечный';
  return `${ru.csv.fileName} ${safe}.csv`;
}
