import { backupCounts, backupFileName, backupTables, makeBackup, type BackupTable } from './backup';

function empty(): Record<BackupTable, Record<string, unknown>[]> {
  return Object.fromEntries(backupTables.map((table) => [table, []])) as unknown as Record<
    BackupTable,
    Record<string, unknown>[]
  >;
}

describe('резервная копия', () => {
  it('содержит версию формата и дату', () => {
    const backup = makeBackup(empty(), new Date('2026-09-29T10:00:00Z'));
    expect(backup).toMatchObject({ app: 'sport-tracker', version: 1, exportedAt: '2026-09-29T10:00:00.000Z' });
    expect(Object.keys(backup.tables)).toHaveLength(9);
  });

  it('считает записи без удалённых', () => {
    const tables = empty();
    tables.clients = [{ id: 'a' }, { id: 'b' }];
    tables.measurements = [{ id: '1', deletedAt: null }, { id: '2', deletedAt: 123 }];
    tables.workouts = [{ id: 'w', deletedAt: null }];
    expect(backupCounts(makeBackup(tables, new Date()))).toEqual({ clients: 2, measurements: 1, workouts: 1 });
  });

  it('имя файла', () => {
    expect(backupFileName('2026-09-29')).toBe('sport-tracker-backup-2026-09-29.json');
  });
});
