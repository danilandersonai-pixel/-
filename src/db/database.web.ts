// В браузерном превью SQLite нет: данные хранятся в localStorage (см. webTable.ts),
// поэтому миграции не нужны и база «готова» сразу.

const api = {
  useDatabaseReady(): { ready: boolean; error?: Error } {
    return { ready: true };
  },
} satisfies Pick<typeof import('./database'), 'useDatabaseReady'>;

export const { useDatabaseReady } = api;
