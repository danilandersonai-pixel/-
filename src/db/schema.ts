import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Схема базы данных. После изменения схемы: npx drizzle-kit generate — появится новая миграция.
// Старые миграции не удалять и не менять.

/** Общие поля всех таблиц. Время — миллисекунды с 1970 года (Date.now()). */
const timestamps = {
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
};

export const clients = sqliteTable('clients', {
  /** UUID — пригодится для будущей синхронизации с облаком */
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  gender: text('gender', { enum: ['male', 'female'] }),
  /** Дата рождения в формате ГГГГ-ММ-ДД */
  birthDate: text('birth_date'),
  phone: text('phone'),
  email: text('email'),
  messenger: text('messenger'),
  goal: text('goal'),
  notes: text('notes'),
  photoUri: text('photo_uri'),
  /** Архив вместо удаления */
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
});

export type Client = typeof clients.$inferSelect;
export type Gender = NonNullable<Client['gender']>;

/** Поля подопечного, которые меняет тренер. Имя обязательно, остальное — по желанию. */
export type ClientFields = Pick<Client, 'firstName'> &
  Partial<Omit<Client, 'id' | 'firstName' | 'archived' | 'createdAt' | 'updatedAt'>>;
