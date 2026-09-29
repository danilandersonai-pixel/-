/// <reference types="node" />
// Тестовая база для jest: настоящий SQLite (встроен в Node 22) с теми же миграциями,
// что и в приложении. Запросы из src/db/*.ts выполняются на ней без изменений.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { drizzle } from 'drizzle-orm/sqlite-proxy';

import * as schema from '../schema';

export function createTestDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  const folder = join(__dirname, '..', 'migrations');
  for (const file of readdirSync(folder)
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    for (const statement of readFileSync(join(folder, file), 'utf8').split('--> statement-breakpoint')) {
      if (statement.trim() !== '') {
        sqlite.exec(statement);
      }
    }
  }

  const db = drizzle(
    async (sql, params, method) => {
      const statement = sqlite.prepare(sql);
      const values = params as (string | number | null)[];
      if (method === 'run') {
        statement.run(...values);
        return { rows: [] };
      }
      const rows = statement.all(...values).map((row) => Object.values(row));
      return { rows: method === 'get' ? (rows[0] ?? []) : rows };
    },
    { schema },
  );
  return { db, sqlite };
}
