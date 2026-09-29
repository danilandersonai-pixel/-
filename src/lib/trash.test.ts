import { buildTrash, type TrashRows } from './trash';

const empty: TrashRows = { measurements: [], workouts: [], photos: [], goals: [], memberships: [], parq: [] };

describe('корзина', () => {
  it('только удалённое, сначала удалённое последним, с именем подопечного', () => {
    const items = buildTrash(
      {
        ...empty,
        measurements: [
          { id: 'm1', clientId: 'c1', date: '2026-09-01', weight: 70, deletedAt: 100 },
          { id: 'm2', clientId: 'c1', date: '2026-09-10', weight: 69, deletedAt: null },
        ],
        workouts: [{ id: 'w1', clientId: 'c2', date: '2026-09-05', status: 'done', startTime: '19:00', deletedAt: 300 }],
        photos: [{ id: 'p1', clientId: 'c1', date: '2026-09-02', angle: 'side', deletedAt: 200 }],
        goals: [{ id: 'g1', clientId: 'c1', startDate: '2026-08-01', metric: 'bodyFat', targetValue: 20, deletedAt: 50 }],
        memberships: [{ id: 's1', clientId: 'c2', startDate: '2026-09-01', total: 12, deletedAt: 400 }],
        parq: [{ id: 'q1', clientId: 'x', date: '2026-01-01', deletedAt: 10 }],
      },
      new Map([
        ['c1', 'Анна'],
        ['c2', 'Игорь'],
      ]),
    );
    expect(items.map((i) => [i.kind, i.id, i.clientName])).toEqual([
      ['membership', 's1', 'Игорь'],
      ['workout', 'w1', 'Игорь'],
      ['photo', 'p1', 'Анна'],
      ['measurement', 'm1', 'Анна'],
      ['goal', 'g1', 'Анна'],
      ['parq', 'q1', '—'],
    ]);
    expect(items[0]).toMatchObject({ date: '2026-09-01', total: 12, deletedAt: 400 });
    expect(items[4]).toMatchObject({ date: '2026-08-01', metric: 'bodyFat', targetValue: 20 });
  });

  it('пустая корзина', () => {
    expect(buildTrash(empty, new Map())).toEqual([]);
  });
});
