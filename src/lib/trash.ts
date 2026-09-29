// Корзина: всё, что тренер удалил. Удаление в приложении — только пометка deletedAt,
// поэтому любую запись можно вернуть. Насовсем данные не стираются.

import type { Goal, Measurement, Membership, ParqForm, Photo, Workout } from '@/db/schema';

export type TrashKind = 'measurement' | 'workout' | 'photo' | 'goal' | 'membership' | 'parq';

type TrashBase = {
  id: string;
  clientId: string;
  clientName: string;
  /** Дата самой записи (замера, тренировки…), ГГГГ-ММ-ДД */
  date: string;
  /** Когда удалили, мс */
  deletedAt: number;
};

export type TrashItem = TrashBase &
  (
    | { kind: 'measurement'; weight: number }
    | { kind: 'workout'; status: Workout['status']; startTime: string | null }
    | { kind: 'photo'; angle: Photo['angle'] }
    | { kind: 'goal'; metric: Goal['metric']; targetValue: number }
    | { kind: 'membership'; total: number }
    | { kind: 'parq' }
  );

type Deleted = { deletedAt: number | null };

export type TrashRows = {
  measurements: (Pick<Measurement, 'id' | 'clientId' | 'date' | 'weight'> & Deleted)[];
  workouts: (Pick<Workout, 'id' | 'clientId' | 'date' | 'status' | 'startTime'> & Deleted)[];
  photos: (Pick<Photo, 'id' | 'clientId' | 'date' | 'angle'> & Deleted)[];
  goals: (Pick<Goal, 'id' | 'clientId' | 'startDate' | 'metric' | 'targetValue'> & Deleted)[];
  memberships: (Pick<Membership, 'id' | 'clientId' | 'startDate' | 'total'> & Deleted)[];
  parq: (Pick<ParqForm, 'id' | 'clientId' | 'date'> & Deleted)[];
};

/** Удалённые записи всех видов одним списком: сначала удалённое последним */
export function buildTrash(rows: TrashRows, clientNames: ReadonlyMap<string, string>): TrashItem[] {
  const base = (row: { id: string; clientId: string; deletedAt: number | null }, date: string): TrashBase => ({
    id: row.id,
    clientId: row.clientId,
    clientName: clientNames.get(row.clientId) ?? '—',
    date,
    deletedAt: row.deletedAt ?? 0,
  });
  const deleted = <T extends Deleted>(list: T[]) => list.filter((row) => row.deletedAt !== null);
  const items: TrashItem[] = [
    ...deleted(rows.measurements).map((r) => ({ ...base(r, r.date), kind: 'measurement' as const, weight: r.weight })),
    ...deleted(rows.workouts).map((r) => ({
      ...base(r, r.date),
      kind: 'workout' as const,
      status: r.status,
      startTime: r.startTime,
    })),
    ...deleted(rows.photos).map((r) => ({ ...base(r, r.date), kind: 'photo' as const, angle: r.angle })),
    ...deleted(rows.goals).map((r) => ({
      ...base(r, r.startDate),
      kind: 'goal' as const,
      metric: r.metric,
      targetValue: r.targetValue,
    })),
    ...deleted(rows.memberships).map((r) => ({ ...base(r, r.startDate), kind: 'membership' as const, total: r.total })),
    ...deleted(rows.parq).map((r) => ({ ...base(r, r.date), kind: 'parq' as const })),
  ];
  return items.sort((a, b) => b.deletedAt - a.deletedAt);
}
