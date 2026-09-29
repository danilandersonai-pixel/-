// Браузерная версия trash.ts для превью: те же функции над таблицами в localStorage.

import { clientFullName } from '@/lib/clients';
import { buildTrash, type TrashItem, type TrashKind } from '@/lib/trash';

import { notifyChange, type TableName } from './changes';
import type { Client, Goal, Measurement, Membership, ParqForm, Photo, Workout } from './schema';
import { browserTable, type WebTable } from './webTable';

const tables = {
  measurement: { table: browserTable<Measurement>('measurements'), change: 'measurements' },
  workout: { table: browserTable<Workout>('workouts'), change: 'workouts' },
  photo: { table: browserTable<Photo>('photos'), change: 'photos' },
  goal: { table: browserTable<Goal>('goals'), change: 'goals' },
  membership: { table: browserTable<Membership>('memberships'), change: 'memberships' },
  parq: { table: browserTable<ParqForm>('parq_forms'), change: 'parq' },
} as const;

/** Общее у всех строк корзины */
type Row = { id: string; deletedAt: number | null; updatedAt: number };

function restoreRow<T extends Row>(table: WebTable<T>, id: string): boolean {
  const row = table.get(id);
  if (!row) {
    return false;
  }
  table.upsert({ ...row, deletedAt: null, updatedAt: Date.now() });
  return true;
}

const api = {
  trashTables: ['measurements', 'workouts', 'photos', 'goals', 'memberships', 'parq', 'clients'] as readonly TableName[],

  async listTrash(): Promise<TrashItem[]> {
    const names = new Map(
      browserTable<Client>('clients')
        .all()
        .map((c) => [c.id, clientFullName(c)]),
    );
    return buildTrash(
      {
        measurements: tables.measurement.table.all(),
        workouts: tables.workout.table.all(),
        photos: tables.photo.table.all(),
        goals: tables.goal.table.all(),
        memberships: tables.membership.table.all(),
        parq: tables.parq.table.all(),
      },
      names,
    );
  },

  async restoreFromTrash(kind: TrashKind, id: string): Promise<void> {
    const { table, change } = tables[kind];
    // Таблицы разные, но restoreRow трогает только общие поля и сохраняет строку целиком
    if (restoreRow<Row>(table as WebTable<Row>, id)) {
      notifyChange(change);
    }
  },
} satisfies typeof import('./trash');

export const { trashTables, listTrash, restoreFromTrash } = api;
