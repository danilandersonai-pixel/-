// Браузерная версия measurements.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { Measurement, MeasurementFields } from './schema';
import { browserTable } from './webTable';

const table = browserTable<Measurement>('measurements');

function newestFirst(a: Measurement, b: Measurement): number {
  return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
}

const emptyMeasurement = {
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
};

const api = {
  async listMeasurements(clientId: string): Promise<Measurement[]> {
    return table
      .all()
      .filter((row) => row.clientId === clientId && row.deletedAt === null)
      .sort(newestFirst);
  },

  async listAllMeasurements(): Promise<Measurement[]> {
    return table
      .all()
      .filter((row) => row.deletedAt === null)
      .sort(newestFirst);
  },

  async getMeasurement(id: string): Promise<Measurement | null> {
    const row = table.get(id);
    return row && row.deletedAt === null ? row : null;
  },

  async saveMeasurement(id: string, clientId: string, fields: MeasurementFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      ...emptyMeasurement,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('measurements');
  },

  async deleteMeasurement(id: string): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      const now = Date.now();
      table.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('measurements');
    }
  },
} satisfies typeof import('./measurements');

export const { listMeasurements, listAllMeasurements, getMeasurement, saveMeasurement, deleteMeasurement } = api;
