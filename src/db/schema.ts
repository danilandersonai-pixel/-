import { integer, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

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

/** Согласие подопечного на обработку персональных данных, в том числе о здоровье (152-ФЗ) */
export const consents = sqliteTable(
  'consents',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    /** Когда подписано, мс */
    signedAt: integer('signed_at').notNull(),
    /** Версия текста согласия, который видел подопечный */
    textVersion: text('text_version').notNull(),
    /** ФИО подписавшего: сам подопечный или законный представитель */
    signedBy: text('signed_by').notNull(),
    /** Когда отозвано, мс. null — действует */
    revokedAt: integer('revoked_at'),
    ...timestamps,
  },
  (table) => [index('consents_client_idx').on(table.clientId)],
);

/** Здоровье: одна запись на подопечного */
export const health = sqliteTable(
  'health',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    contraindications: text('contraindications'),
    injuries: text('injuries'),
    limitations: text('limitations'),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [uniqueIndex('health_client_idx').on(table.clientId)],
);

export type Consent = typeof consents.$inferSelect;
export type Health = typeof health.$inferSelect;
export type HealthFields = Partial<Pick<Health, 'contraindications' | 'injuries' | 'limitations' | 'notes'>>;
